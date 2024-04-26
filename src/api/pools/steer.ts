import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { approveErc20 } from "src/api/token";
import { awaitTransaction, getConnectorId, subtractGas, toEth } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { addressesByChainId } from "src/config/constants/contracts";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    FarmFunctions,
    GetFarmDataProcessedFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    TokenAmounts,
    ZapInBaseFn,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { defaultChainId, web3AuthConnectorId } from "src/config/constants";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import {
    filterAssetChanges,
    filterStateDiff,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
} from "../tenderly";
import { isGasSponsored } from "..";
import { zapOutBase, slippageOut } from "./common";
import merge from "lodash.merge";
import { Address, encodeFunctionData, getContract, zeroAddress } from "viem";
import { bundlerClient } from "src/config/walletConfig";

let steer = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[zeroAddress];
        const vaultTokenPrice = prices[farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.vault_addr] || 0);

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress as Address;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(BigInt(balances[usdcAddress]!), decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(BigInt(balances[usdcAddress]!), decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: toEth(BigInt(balances[zeroAddress]!), 18),
                amountDollar: (Number(toEth(BigInt(balances[zeroAddress]!), 18)) * ethPrice).toString(),
                price: ethPrice,
            },
        ];

        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[usdcAddress],
                isPrimaryVault: true,
            },
            {
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: ethPrice,
            },
        ];

        const result = {
            depositableAmounts,
            withdrawableAmounts,
            vaultBalanceFormated: (Number(toEth(BigInt(vaultTotalSupply ?? 0))) * vaultTokenPrice).toString(),
            id: farm.id,
        };
        return result;
    };

    const zapInSteerBase: ZapInBaseFn = async ({
        farm,
        amountInWei,
        balances,
        token,
        currentWallet,
        client,
        chainId,
        max,
        tokenIn,
        prices,
        decimals,
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

            //#region Token Amounts
            const vaultContract = getContract({
                address: farm.vault_addr as Address,
                abi: farm.vault_abi,
                client,
            });
            // @ts-ignore
            const steerVaultTokens = (await zapperContract.read.steerVaultTokens(farm.vault_addr)) as Address[];
            // @ts-ignore
            const getTotalAmounts = (await zapperContract.read.getTotalAmounts(farm.vault_addr)) as bigint[];

            const token0Staked =
                prices![steerVaultTokens[0]] * Number(toEth(getTotalAmounts[0], decimals![steerVaultTokens[0]]));
            const token1Staked =
                prices![steerVaultTokens[1]] * Number(toEth(getTotalAmounts[1], decimals![steerVaultTokens[1]]));

            const token0Amount =
                (amountInWei * BigInt(((token0Staked / (token0Staked + token1Staked)) * 10 ** 12).toFixed())) /
                10n ** 12n;

            const token1Amount = amountInWei - token0Amount;
            //#endregion Token Amounts

            // #region Approve
            // first approve tokens, if zap is not in eth
            if (token !== zeroAddress) {
                notiId = notifyLoading(loadingMessages.approvingZapping());
                const response = await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, client);
                if (!response.status) throw new Error("Error approving vault!");
                dismissNotify(notiId);
            }
            // #endregion

            // #region Zapping In
            notiId = notifyLoading(loadingMessages.zapping());

            // eth zap
            if (token === zeroAddress) {
                // use weth address as tokenId, but in case of some farms (e.g: hop)
                // we need the token of liquidity pair, so use tokenIn if provided
                token = tokenIn ?? wethAddress;

                //#region Gas Logic
                // if we are using zero dev, don't bother
                const connectorId = getConnectorId();
                // TODO: modify isGasSponsored
                if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                    const balance = BigInt(balances[zeroAddress] || 0);

                    const afterGasCut = await subtractGas(
                        amountInWei,
                        client,
                        client.wallet.estimateTxGas({
                            to: farm.zapper_addr,
                            value: balance,
                            data: encodeFunctionData({
                                abi: farm.zapper_abi,
                                functionName: "zapInETH",
                                args: [farm.vault_addr, 0, token, token0Amount, token1Amount],
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
                    zapperContract.write.zapInETH([farm.vault_addr, 0, token, token0Amount, token1Amount], {
                        value: amountInWei,
                    }),
                    client
                );
            }
            // token zap
            else {
                zapperTxn = await awaitTransaction(
                    zapperContract.write.zapIn([farm.vault_addr, 0, token, token0Amount, token1Amount]),
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
            notiId && dismissNotify(notiId);
            notifyError(errorMessages.generalError(error.shortDetails || error.details || error.message));
        }
    };

    const slippageIn: SlippageInBaseFn = async (args) => {
        let { amountInWei, balances, chainId, currentWallet, token, max, client, tokenIn, farm, decimals, prices } =
            args;
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

        //#region Token Amounts
        const vaultContract = getContract({
            address: farm.vault_addr as Address,
            abi: farm.vault_abi,
            client,
        });
        // @ts-ignore
        const steerVaultTokens: string[] = (await zapperContract.read.steerVaultTokens(farm.vault_addr)) as unknown;
        // @ts-ignore
        const getTotalAmounts: bigint[] = (await zapperContract.read.getTotalAmounts(farm.vault_addr)) as unknown;

        const token0Staked =
            prices![steerVaultTokens[0]] * Number(toEth(getTotalAmounts[0], decimals![steerVaultTokens[0]]));
        const token1Staked =
            prices![steerVaultTokens[1]] * Number(toEth(getTotalAmounts[1], decimals![steerVaultTokens[1]]));

        const token0Amount =
            (amountInWei * BigInt(((token0Staked / (token0Staked + token1Staked)) * 10 ** 12).toFixed())) / 10n ** 12n;
        const token1Amount = amountInWei - token0Amount;
        //#endregion Token Amounts

        if (token !== zeroAddress) {
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

        if (token === zeroAddress) {
            // use weth address as tokenId, but in case of some farms (e.g: hop)
            // we need the token of liquidity pair, so use tokenIn if provided
            token = tokenIn ?? wethAddress;
            //#region Gas Logic
            // if we are using zero dev, don't bother
            const connectorId = getConnectorId();
            if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                const balance = BigInt(balances[zeroAddress] || 0);
                const afterGasCut = await subtractGas(
                    amountInWei,
                    client,
                    client.wallet.estimateTxGas({
                        to: farm.zapper_addr,
                        value: balance,
                        data: encodeFunctionData({
                            abi: farm.zapper_abi,
                            functionName: "zapInETH",
                            args: [farm.vault_addr, 0, token, token0Amount, token1Amount],
                        }),
                    })
                );
                if (!afterGasCut) return BigInt(0);
                amountInWei = afterGasCut;
            }
            //#endregion
            const populated = {
                data: encodeFunctionData({
                    abi: farm.zapper_abi,
                    functionName: "zapInETH",
                    args: [farm.vault_addr, 0, token, token0Amount, token1Amount],
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
                    args: [farm.vault_addr, 0, token, token0Amount, token1Amount],
                }),
                value: 0,
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

    const zapIn: ZapInFn = (props) => zapInSteerBase({ ...props, farm });
    const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
    const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

    return {
        getProcessedFarmData,
        zapIn,
        zapOut,
        zapInSlippage,
        zapOutSlippage,
    };
};

export default steer;
