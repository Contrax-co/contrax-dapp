import { approveErc20 } from "src/api/token";
import { awaitTransaction, getCombinedBalance, subtractGas, toEth } from "src/utils/common";
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
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import {
    filterAssetChanges,
    filterStateDiff,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
} from "../tenderly";
import { isGasSponsored } from "..";
import { zapOutBase, slippageOut, crossChainBridgeIfNecessary } from "./common";
import merge from "lodash.merge";
import pools_json from "src/config/constants/pools_json";
import steerZapperAbi from "src/assets/abis/steerZapperAbi";
import { encodeFunctionData, zeroAddress } from "viem";
import store from "src/state";
import { editTransaction } from "src/state/transactions/transactionsReducer";
import { TransactionStatus } from "src/state/transactions/types";

let steer = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr]);
        const zapCurriences = farm.zap_currencies;
        const combinedUsdcBalance = getCombinedBalance(balances, "usdc");
        const combinedEthBalance = getCombinedBalance(balances, "eth");
        const usdcAddress = addressesByChainId[farm.chainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: combinedUsdcBalance.formattedBalance.toString(),
                amountDollar: combinedUsdcBalance.formattedBalance.toString(),
                price: prices[farm.chainId][usdcAddress],
            },
            {
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: combinedEthBalance.formattedBalance.toString(),
                amountDollar: (Number(combinedEthBalance.formattedBalance) * ethPrice).toString(),
                price: ethPrice,
            },
        ];

        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[farm.chainId][usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[farm.chainId][usdcAddress],
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
        id,
        currentWallet,
        max,
        tokenIn,
        estimateTxGas,
        getClients,
        getPublicClient,
    }) => {
        const wethAddress = addressesByChainId[farm.chainId].wethAddress;
        const publicClient = getPublicClient(farm.chainId);
        let zapperTxn;
        try {
            //#region Select Max
            if (max) {
                const { balance } = getCombinedBalance(balances, token === zeroAddress ? "eth" : "usdc");
                amountInWei = BigInt(balance);
            }
            //#endregion

            // #region Approve
            // first approve tokens, if zap is not in eth
            if (token !== zeroAddress) {
                notifyLoading(loadingMessages.approvingZapping(), { id });
                const client = await getClients(farm.chainId);
                const response = await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, client);
                if (!response.status) throw new Error("Error approving vault!");
                dismissNotify(id);
            }
            // #endregion

            // #region Zapping In
            notifyLoading(loadingMessages.zapping(), { id });

            // eth zap
            if (token === zeroAddress) {
                // use weth address as tokenId, but in case of some farms (e.g: hop)
                // we need the token of liquidity pair, so use tokenIn if provided
                token = tokenIn ?? wethAddress;

                // const client = await getClients(farm.chainId);

                // zapperTxn = await awaitTransaction(
                //     client.wallet.sendTransaction({
                //         to: farm.zapper_addr,
                //         value: amountInWei,
                //         data: encodeFunctionData({
                //             abi: steerZapperAbi,
                //             functionName: "zapInETH",
                //             args: [farm.vault_addr, 0n, token],
                //         }),
                //     }),
                //     { public: publicClient },
                //     (hash) => {
                //         store.dispatch(editTransaction({ id, txHash: hash, status: TransactionStatus.PENDING }));
                //     }
                // );

                const {
                    finalAmountToDeposit,
                    isBridged,
                    status: bridgeStatus,
                } = await crossChainBridgeIfNecessary({
                    getClients,
                    notificationId: id,
                    balances,
                    currentWallet,
                    toChainId: farm.chainId,
                    toToken: zeroAddress,
                    toTokenAmount: amountInWei,
                    max,
                });
                if (bridgeStatus) {
                    const client = await getClients(farm.chainId);
                    if (isBridged) amountInWei = finalAmountToDeposit;

                    const afterGasCut = await subtractGas(
                        amountInWei,
                        { public: publicClient },
                        estimateTxGas({
                            to: farm.zapper_addr,
                            value: amountInWei,
                            chainId: farm.chainId,
                            data: encodeFunctionData({
                                abi: steerZapperAbi,
                                functionName: "zapInETH",
                                args: [farm.vault_addr, 0n, token],
                            }),
                        })
                    );
                    if (!afterGasCut) {
                        dismissNotify(id);
                        throw new Error("Error subtracting gas!");
                    }

                    notifyLoading(loadingMessages.zapping(), { id });

                    zapperTxn = await awaitTransaction(
                        client.wallet.sendTransaction({
                            to: farm.zapper_addr,
                            value: afterGasCut,
                            data: encodeFunctionData({
                                abi: steerZapperAbi,
                                functionName: "zapInETH",
                                args: [farm.vault_addr, 0n, token],
                            }),
                        }),
                        client,
                        (hash) => {
                            store.dispatch(editTransaction({ id, txHash: hash, status: TransactionStatus.PENDING }));
                        }
                    );
                } else {
                    zapperTxn = {
                        status: false,
                        error: "Bridge Failed",
                    };
                }
            }
            // token zap
            else {
                const {
                    status: bridgeStatus,
                    isBridged,
                    finalAmountToDeposit,
                } = await crossChainBridgeIfNecessary({
                    getClients,
                    notificationId: id,
                    balances,
                    currentWallet,
                    toChainId: farm.chainId,
                    toToken: token,
                    toTokenAmount: amountInWei,
                    max,
                });
                if (bridgeStatus) {
                    const client = await getClients(farm.chainId);
                    if (isBridged) amountInWei = finalAmountToDeposit;
                    notifyLoading(loadingMessages.zapping(), { id });
                    zapperTxn = await awaitTransaction(
                        client.wallet.sendTransaction({
                            to: farm.zapper_addr,
                            data: encodeFunctionData({
                                abi: steerZapperAbi,
                                functionName: "zapIn",
                                args: [farm.vault_addr, 0n, token, amountInWei],
                            }),
                        }),
                        client,
                        (hash) => {
                            store.dispatch(editTransaction({ id, txHash: hash, status: TransactionStatus.PENDING }));
                        }
                    );
                } else {
                    zapperTxn = {
                        status: false,
                        error: "Bridge Failed",
                    };
                }
            }

            if (!zapperTxn.status) {
                store.dispatch(editTransaction({ id, status: TransactionStatus.FAILED }));
                throw new Error(zapperTxn.error);
            } else {
                dismissNotify(id);
                notifySuccess(successMessages.zapIn());
                store.dispatch(editTransaction({ id, txHash: zapperTxn.txHash, status: TransactionStatus.SUCCESS }));
            }
            // #endregion
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
            dismissNotify(id);
            store.dispatch(editTransaction({ id, status: TransactionStatus.FAILED }));
            notifyError(errorMessages.generalError(error.message || err.reason || err.message));
        }
    };

    const slippageIn: SlippageInBaseFn = async (args) => {
        let {
            amountInWei,
            balances,
            currentWallet,
            token,
            max,
            estimateTxGas,
            getPublicClient,
            getClients,
            tokenIn,
            farm,
        } = args;
        const wethAddress = addressesByChainId[farm.chainId].wethAddress;

        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            const { balance } = getCombinedBalance(balances, token === zeroAddress ? "eth" : "usdc");
            amountInWei = BigInt(balance);
        }

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

            const { afterBridgeBal } = await crossChainBridgeIfNecessary({
                getClients,
                balances,
                currentWallet,
                toChainId: farm.chainId,
                toToken: zeroAddress,
                toTokenAmount: amountInWei,
                max,
                simulate: true,
            });
            // No gas estimate needed
            //#endregion
            const populated = {
                data: encodeFunctionData({
                    abi: steerZapperAbi,
                    functionName: "zapInETH",
                    args: [farm.vault_addr, 0n, token],
                }),
                value: afterBridgeBal,
            };

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        } else {
            const { afterBridgeBal } = await crossChainBridgeIfNecessary({
                getClients,
                balances,
                currentWallet,
                toChainId: farm.chainId,
                toToken: token,
                toTokenAmount: amountInWei,
                max,
                simulate: true,
            });
            const populated = {
                data: encodeFunctionData({
                    abi: steerZapperAbi,
                    functionName: "zapIn",
                    args: [farm.vault_addr, 0n, token, afterBridgeBal],
                }),
            };
            transaction.input = populated.data || "";
        }
        console.log(transaction, farm);
        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.zapper_addr,
            chainId: farm.chainId,
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
