import { Farm } from "src/types";
import { BigNumber, Signer, Contract, utils, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import {
    awaitTransaction,
    getConnectorId,
    isZeroDevSigner,
    subtractGas,
    toEth,
    validateNumberDecimals,
} from "src/utils/common";
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
    simulateTransaction,
} from "../tenderly";

export const zapInBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    currentWallet,
    signer,
    chainId,
    max,
    tokenIn,
}) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const wethAddress = addressesByChainId[chainId].wethAddress;
    let zapperTxn;
    let notiId;
    try {
        //#region Select Max
        if (max) {
            amountInWei = balances[token] ?? "0";
        }
        amountInWei = BigNumber.from(amountInWei);
        //#endregion

        // #region Approve
        // first approve tokens, if zap is not in eth
        if (token !== constants.AddressZero) {
            notiId = notifyLoading(loadingMessages.approvingZapping());
            const response = await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, signer);
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
                const balance = BigNumber.from(balances[constants.AddressZero]);
                const afterGasCut = await subtractGas(
                    amountInWei,
                    signer,
                    zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
                        value: balance,
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
                zapperContract.zapInETH(farm.vault_addr, 0, token, {
                    value: amountInWei,
                })
            );
        }
        // token zap
        else {
            const tx = zapperContract.populateTransaction.zapIn(farm.vault_addr, 0, token, amountInWei);

            zapperTxn = await awaitTransaction(zapperContract.zapIn(farm.vault_addr, 0, token, amountInWei));
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

export const zapOutBase: ZapOutBaseFn = async ({ farm, amountInWei, token, currentWallet, signer, chainId, max }) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    let notiId = notifyLoading(loadingMessages.approvingWithdraw());
    try {
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, signer.provider!);

        //#region Approve
        if (!(await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
            throw new Error("Error approving vault!");

        if (!(await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
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
                zapperContract.zapOutAndSwapEth(farm.vault_addr, max ? vaultBalance : amountInWei, 0)
            );
        } else {
            withdrawTxn = await awaitTransaction(
                zapperContract.zapOutAndSwap(farm.vault_addr, max ? vaultBalance : amountInWei, token, 0)
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

export const zapInSteerBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    currentWallet,
    signer,
    chainId,
    max,
    tokenIn,
}) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const wethAddress = addressesByChainId[chainId].wethAddress;
    let zapperTxn;
    let notiId;
    try {
        //#region Select Max
        if (max) {
            amountInWei = balances[token] ?? "0";
        }
        amountInWei = BigNumber.from(amountInWei);
        const token0Amount = amountInWei.div(2);
        const token1Amount = amountInWei.sub(token0Amount);

        //#endregion

        // #region Approve
        // first approve tokens, if zap is not in eth
        if (token !== constants.AddressZero) {
            notiId = notifyLoading(loadingMessages.approvingZapping());
            const response = await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, signer);
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
                const balance = BigNumber.from(balances[constants.AddressZero]);

                const afterGasCut = await subtractGas(
                    amountInWei,
                    signer,
                    zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, token0Amount, token1Amount, {
                        value: balance,
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
                zapperContract.zapInETH(farm.vault_addr, 0, token, token0Amount, token1Amount, {
                    value: amountInWei,
                })
            );
        }
        // token zap
        else {
            const tx = zapperContract.populateTransaction.zapIn(farm.vault_addr, 0, token, token0Amount, token1Amount);

            zapperTxn = await awaitTransaction(
                zapperContract.zapIn(farm.vault_addr, 0, token, token0Amount, token1Amount)
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

export const zapOutSteerBase: ZapOutBaseFn = async ({
    farm,
    amountInWei,
    token,
    currentWallet,
    signer,
    chainId,
    max,
}) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    let notiId = notifyLoading(loadingMessages.approvingWithdraw());
    try {
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, signer.provider!);

        //#region Approve
        if (!(await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
            throw new Error("Error approving vault!");

        if (!(await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
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
                zapperContract.zapOutAndSwapEth(farm.vault_addr, max ? vaultBalance : amountInWei, 0)
            );
        } else {
            withdrawTxn = await awaitTransaction(
                zapperContract.zapOutAndSwap(farm.vault_addr, max ? vaultBalance : amountInWei, token, 0)
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
    let { amountInWei, balances, chainId, currentWallet, token, max, signer, tokenIn, farm } = args;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const wethAddress = addressesByChainId[chainId].wethAddress;

    const transaction = {} as Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >;
    transaction.from = currentWallet;

    if (max) {
        amountInWei = balances[token] ?? "0";
    }
    amountInWei = BigNumber.from(amountInWei);
    if (token !== constants.AddressZero) {
        transaction.state_overrides = getAllowanceStateOverride([
            {
                tokenAddress: token,
                owner: currentWallet,
                spender: farm.zapper_addr,
            },
        ]);
    }

    if (token === constants.AddressZero) {
        // use weth address as tokenId, but in case of some farms (e.g: hop)
        // we need the token of liquidity pair, so use tokenIn if provided
        token = tokenIn ?? wethAddress;

        //#region Gas Logic
        // if we are using zero dev, don't bother
        const connectorId = getConnectorId();
        if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
            const balance = BigNumber.from(balances[constants.AddressZero]);
            const afterGasCut = await subtractGas(
                amountInWei,
                signer!,
                zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
                    value: balance,
                })
            );
            if (!afterGasCut) return BigNumber.from(0);
            amountInWei = afterGasCut;
        }
        //#endregion

        const populated = await zapperContract.populateTransaction.zapInETH(farm.vault_addr, 0, token, {
            value: amountInWei,
        });

        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    } else {
        const populated = await zapperContract.populateTransaction.zapIn(farm.vault_addr, 0, token, amountInWei);
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
    return BigNumber.from(assetChanges.difference);
};

export const slippageOut: SlippageOutBaseFn = async ({ signer, farm, token, max, amountInWei, currentWallet }) => {
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const transaction = {} as Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >;
    transaction.from = currentWallet;
    const vaultBalance = await getBalance(farm.vault_addr, currentWallet, signer?.provider!);

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
    //#endregion

    //#region Zapping Out
    if (max) {
        amountInWei = vaultBalance;
    }
    if (token === constants.AddressZero) {
        const populated = await zapperContract.populateTransaction.zapOutAndSwapEth(
            farm.vault_addr,
            max ? vaultBalance : amountInWei,
            0
        );

        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    } else {
        const populated = await zapperContract.populateTransaction.zapOutAndSwap(
            farm.vault_addr,
            max ? vaultBalance : amountInWei,
            token,
            0
        );

        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    }
    //#endregion
    const simulationResult = await simulateTransaction({
        /* Standard EVM Transaction object */
        ...transaction,
        to: farm.zapper_addr,
    });
    console.log("simulationResult =>", simulationResult);
    let difference = BigNumber.from(0);
    if (token === constants.AddressZero) {
        const { before, after } = filterBalanceChanges(currentWallet, simulationResult.balanceDiff);
        difference = BigNumber.from(after).sub(before || "0");
    } else {
        const { added, subtracted } = filterAssetChanges(token, currentWallet, simulationResult.assetChanges);
        difference = BigNumber.from(added).sub(subtracted);
    }

    return difference;
};
