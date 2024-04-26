import { Farm } from "src/types";
import { BigNumber, Signer, Contract, utils, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getConnectorId, subtractGas, toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    DynamicFarmFunctions,
    GetFarmDataProcessedFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    TokenAmounts,
    WithdrawFn,
    ZapInArgs,
    ZapInBaseFn,
    ZapInFn,
    ZapOutBaseFn,
    ZapOutFn,
} from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { defaultChainId, web3AuthConnectorId } from "src/config/constants";
import { backendApi, isGasSponsored } from "..";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import {
    filterAssetChanges,
    filterBalanceChanges,
    filterStateDiff,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
} from "../tenderly";
import merge from "lodash.merge";
import { Address, encodeFunctionData, getContract, zeroAddress } from "viem";

export const zapInBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    currentWallet,
    client,
    chainId,
    max,
    tokenIn,
}) => {
    const zapperContract = getContract({
        address: farm.zapper_addr as Address,
        abi: farm.zapper_abi,
        client,
    });
    const wethAddress = addressesByChainId[chainId].wethAddress as Address;
    let zapperTxn;
    let notiId;
    try {
        //#region Select Max
        if (max) {
            amountInWei = BigInt(balances[token] ?? "0");
        }
        //#endregion

        // #region Approve
        // first approve tokens, if zap is not in eth
        if (token !== constants.AddressZero) {
            notiId = notifyLoading(loadingMessages.approvingZapping());
            const response = await approveErc20(token, farm.zapper_addr as Address, amountInWei, currentWallet, client);
            if (!response.status) throw new Error("Error approving vault!");
            dismissNotify(notiId);
        }
        // #endregion

        // #region Zapping In
        notiId = notifyLoading(loadingMessages.zapping());

        // eth zap
        if (token === constants.AddressZero) {
            // use weth address as tokenId, but in case of some farms (e.g: hop)
            // we need the token of liquidity pair, so use tokenIn if provided
            token = tokenIn ?? wethAddress;

            //#region Gas Logic
            // if we are using zero dev, don't bother
            const connectorId = getConnectorId();
            if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                const balance = BigInt(balances[zeroAddress] || "0");
                const afterGasCut = await subtractGas(
                    amountInWei,
                    client,
                    client.wallet.estimateTxGas({
                        to: farm.zapper_addr,
                        value: balance,
                        data: encodeFunctionData({
                            abi: farm.zapper_abi,
                            functionName: "zapInETH",
                            args: [farm.vault_addr, 0, token],
                        }),
                    })
                );
                if (!afterGasCut) {
                    notiId && dismissNotify(notiId);
                    return;
                }
                amountInWei = afterGasCut;
            }
            //#endregion

            zapperTxn = await awaitTransaction(
                zapperContract.write.zapInETH([farm.vault_addr, 0, token], {
                    value: amountInWei,
                }),
                client
            );
        }
        // token zap
        else {
            zapperTxn = await awaitTransaction(
                zapperContract.write.zapIn([farm.vault_addr, 0, token, amountInWei]),
                client
            );
        }

        if (!zapperTxn.status) {
            throw new Error(zapperTxn.error);
        } else {
            dismissNotify(notiId);
            notifySuccess(successMessages.zapIn());
        }
        // #endregion
    } catch (error: any) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        notiId && dismissNotify(notiId);
        notifyError(errorMessages.generalError(error.message || err.reason || err.message));
    }
};

export const zapOutBase: ZapOutBaseFn = async ({ farm, amountInWei, token, currentWallet, client, chainId, max }) => {
    const zapperContract = getContract({
        address: farm.zapper_addr as Address,
        abi: farm.zapper_abi,
        client,
    });
    let notiId = notifyLoading(loadingMessages.approvingWithdraw());
    try {
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);

        //#region Approve
        if (!(await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, client)).status)
            throw new Error("Error approving vault!");

        if (!(await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, client)).status)
            throw new Error("Error approving lp!");

        dismissNotify(notiId);
        //#endregion

        //#region Zapping Out
        notiId = notifyLoading(loadingMessages.withDrawing());

        let withdrawTxn;
        if (max) {
            amountInWei = vaultBalance;
        }
        if (token === constants.AddressZero) {
            withdrawTxn = await awaitTransaction(
                zapperContract.write.zapOutAndSwapEth([farm.vault_addr, max ? vaultBalance : amountInWei, 0n]),
                client
            );
        } else {
            withdrawTxn = await awaitTransaction(
                zapperContract.write.zapOutAndSwap([farm.vault_addr, max ? vaultBalance : amountInWei, token, 0]),
                client
            );
        }

        if (!withdrawTxn.status) {
            throw new Error(withdrawTxn.error);
        } else {
            dismissNotify(notiId);
            notifySuccess(successMessages.withdraw());
        }
        //#endregion
    } catch (error: any) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        dismissNotify(notiId);
        notifyError(errorMessages.generalError(error.message || err.reason || err.message));
    }
};

export const slippageIn: SlippageInBaseFn = async (args) => {
    let { amountInWei, balances, chainId, currentWallet, token, max, client, tokenIn, farm } = args;

    const zapperContract = getContract({
        address: farm.zapper_addr as Address,
        abi: farm.zapper_abi,
        client,
    });
    const wethAddress = addressesByChainId[chainId].wethAddress as Address;

    const transaction = {} as Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >;
    transaction.from = currentWallet;

    if (max) {
        amountInWei = BigInt(balances[token] ?? "0");
    }
    amountInWei = amountInWei;
    if (token !== constants.AddressZero) {
        transaction.state_overrides = getAllowanceStateOverride([
            {
                tokenAddress: token,
                owner: currentWallet,
                spender: farm.zapper_addr,
            },
        ]);
        merge(
            transaction.state_overrides,
            getTokenBalanceStateOverride({
                owner: currentWallet,
                tokenAddress: token,
                balance: amountInWei.toString(),
            })
        );
    } else {
        transaction.balance_overrides = {
            [currentWallet]: amountInWei.toString(),
        };
    }

    if (token === constants.AddressZero) {
        // use weth address as tokenId, but in case of some farms (e.g: hop)
        // we need the token of liquidity pair, so use tokenIn if provided
        token = tokenIn ?? wethAddress;

        //#region Gas Logic
        // if we are using zero dev, don't bother
        const connectorId = getConnectorId();
        if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
            const balance = BigInt(balances[zeroAddress] || "0");
            const afterGasCut = await subtractGas(
                amountInWei,
                client!,
                client.wallet.estimateTxGas({
                    to: farm.zapper_addr,
                    value: balance,
                    data: encodeFunctionData({
                        abi: farm.zapper_abi,
                        functionName: "zapInETH",
                        args: [farm.vault_addr, 0, token],
                    }),
                })
            );
            if (!afterGasCut) return 0n;
            amountInWei = afterGasCut;
        }
        //#endregion
        const populated = {
            data: encodeFunctionData({
                abi: farm.zapper_abi,
                functionName: "zapInETH",
                args: [farm.vault_addr, 0, token],
            }),
            value: amountInWei,
        };

        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    } else {
        const populated = {
            data: encodeFunctionData({
                abi: farm.zapper_abi,
                functionName: "zapIn",
                args: [farm.vault_addr, 0, token, amountInWei],
            }),
            value: "0",
        };
        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    }
    console.log(transaction, farm);
    const simulationResult = await simulateTransaction({
        /* Standard EVM Transaction object */
        ...transaction,
        to: farm.zapper_addr,
    });
    console.log({ simulationResult });
    const assetChanges = filterAssetChanges(farm.vault_addr, currentWallet, simulationResult.assetChanges);
    // const filteredState = filterStateDiff(farm.vault_addr, "_balances", simulationResult.stateDiffs);
    const filteredState = filterStateDiff(farm.vault_addr, "_balances", simulationResult.stateDiffs);
    // const difference = BigNumber.from(filteredState.afterChange[args.currentWallet.toLowerCase()]).sub(
    //     BigNumber.from(filteredState.original[args.currentWallet.toLowerCase()])
    // );
    // const filteredState = filterStateDiff(farm.lp_address, "_balances", simulationResult.stateDiffs);
    // const difference = BigNumber.from(filteredState.afterChange[farm.vault_addr.toLowerCase()]).sub(
    //     BigNumber.from(filteredState.original[farm.vault_addr.toLowerCase()])
    // );
    // const difference = BigNumber.from(assetChanges.added);
    return assetChanges.difference;
};

export const slippageOut: SlippageOutBaseFn = async ({ client, farm, token, max, amountInWei, currentWallet }) => {
    const transaction = {} as Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >;
    transaction.from = currentWallet;
    const vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);

    //#region Approve
    transaction.state_overrides = getAllowanceStateOverride([
        {
            tokenAddress: farm.vault_addr,
            owner: currentWallet,
            spender: farm.zapper_addr,
        },
        {
            tokenAddress: farm.lp_address,
            owner: currentWallet,
            spender: farm.zapper_addr,
        },
    ]);
    merge(
        transaction.state_overrides,
        getTokenBalanceStateOverride({
            owner: currentWallet,
            tokenAddress: farm.vault_addr,
            balance: amountInWei.toString(),
        })
    );
    //#endregion

    //#region Zapping Out

    if (token === constants.AddressZero) {
        const populated = {
            data: encodeFunctionData({
                abi: farm.zapper_abi,
                functionName: "zapOutAndSwapEth",
                args: [farm.vault_addr, max ? vaultBalance : amountInWei, 0],
            }),
            value: "0",
        };

        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    } else {
        const populated = {
            data: encodeFunctionData({
                abi: farm.zapper_abi,
                functionName: "zapOutAndSwap",
                args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0],
            }),
            value: "0",
        };
        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    }
    //#endregion
    console.log(transaction, farm);
    const simulationResult = await simulateTransaction({
        /* Standard EVM Transaction object */
        ...transaction,
        to: farm.zapper_addr,
    });
    console.log("simulationResult =>", simulationResult);
    let difference = 0n;
    if (token === zeroAddress) {
        const { before, after } = filterBalanceChanges(currentWallet, simulationResult.balanceDiff);
        difference = after - before;
    } else {
        const { added, subtracted } = filterAssetChanges(token, currentWallet, simulationResult.assetChanges);
        difference = added - subtracted;
    }

    return difference;
};
