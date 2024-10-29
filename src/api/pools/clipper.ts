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
import { defaultChainId } from "src/config/constants";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import {
    filterAssetChanges,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
} from "../tenderly";
import { backendApi, isGasSponsored } from "..";
import { zapOutBase, slippageOut, bridgeIfNeededLayerZero } from "./common";
import merge from "lodash.merge";
import { encodeFunctionData, getContract, Hex, zeroAddress } from "viem";
import pools_json from "src/config/constants/pools_json";
import zapperAbi from "src/assets/abis/zapperAbi";
import clipperZapperAbi from "src/assets/abis/clipperZapperAbi";
import { ApproveZapStep, TransactionStepStatus, TransactionTypes, ZapInStep } from "src/state/transactions/types";
import store from "src/state";
import {
    addTransactionStepDb,
    editTransactionDb,
    editTransactionStepDb,
    markAsFailedDb,
} from "src/state/transactions/transactionsReducer";

let clipper = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr] || 0);
        const zapCurriences = farm.zap_currencies;
        const combinedUsdcBalance = getCombinedBalance(balances, farm.chainId, "usdc");
        const combinedEthBalance = getCombinedBalance(balances, farm.chainId, "native");

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;
        let isCrossChain = true;
        const usdcCurrentChainBalance = Number(toEth(combinedUsdcBalance.chainBalances[farm.chainId], 6));
        if (usdcCurrentChainBalance >= 100) isCrossChain = false;

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
                tokenSymbol: combinedEthBalance.symbol,
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
                tokenSymbol: combinedEthBalance.symbol,
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: ethPrice,
            },
        ];

        const result = {
            depositableAmounts,
            withdrawableAmounts,
            isCrossChain,
            vaultBalanceFormated: (Number(toEth(BigInt(vaultTotalSupply || 0))) * vaultTokenPrice).toString(),
            id: farm.id,
        };
        return result;
    };

    const zapInClipperBase: ZapInBaseFn = async ({
        farm,
        amountInWei,
        balances,
        token,
        currentWallet,
        getClients,
        max,
        tokenIn,
        id,
        isSocial,
        estimateTxGas,
        prices,
        getPublicClient,
        getWalletClient,
        decimals,
    }) => {
        const publicClient = getPublicClient(farm.chainId);

        const wethAddress = addressesByChainId[farm.chainId].wethAddress;
        let zapperTxn;
        try {
            //#region Select Max
            if (max) {
                const { balance } = getCombinedBalance(
                    balances,
                    farm.chainId,
                    token === zeroAddress ? "native" : "usdc"
                );
                amountInWei = BigInt(balance);
            }
            // #region Zapping In
            notifyLoading(loadingMessages.zapping(), { id });

            // eth zap
            if (token === zeroAddress) {
                // use weth address as tokenId, but in case of some farms (e.g: hop)
                // we need the token of liquidity pair, so use tokenIn if provided
                token = tokenIn ?? wethAddress;

                const {
                    finalAmountToDeposit,
                    isBridged,
                    status: bridgeStatus,
                } = await bridgeIfNeededLayerZero({
                    getPublicClient,
                    getWalletClient,
                    notificationId: id,
                    balances,
                    currentWallet,
                    toChainId: farm.chainId,
                    toToken: zeroAddress,
                    toTokenAmount: amountInWei,
                    max,
                });
                if (bridgeStatus) {
                    store.dispatch(
                        addTransactionStepDb({
                            transactionId: id!,
                            step: {
                                type: TransactionTypes.ZAP_IN,
                                amount: amountInWei.toString(),
                                status: TransactionStepStatus.IN_PROGRESS,
                            } as ZapInStep,
                        })
                    );
                    const client = await getClients(farm.chainId);
                    if (isBridged) amountInWei = finalAmountToDeposit;

                    if (!isSocial && !(await isGasSponsored(currentWallet))) {
                        const { packedConfig, packedInput, r, s } = await createClipperData(
                            amountInWei.toString(),
                            token === zeroAddress ? wethAddress : token,
                            farm.zapper_addr
                        );
                        const afterGasCut = await subtractGas(
                            amountInWei,
                            { public: publicClient },
                            estimateTxGas({
                                to: farm.zapper_addr,
                                value: amountInWei,
                                chainId: farm.chainId,
                                data: encodeFunctionData({
                                    abi: clipperZapperAbi,
                                    functionName: "zapInETH",
                                    args: [farm.vault_addr, 0n, packedInput, packedConfig, r, s],
                                }),
                            })
                        );
                        if (!afterGasCut) {
                            dismissNotify(id);
                            throw new Error("Error subtracting gas!");
                        }
                        amountInWei = afterGasCut;
                    }

                    notifyLoading(loadingMessages.zapping(), { id });
                    const finalConfig = await createClipperData(
                        amountInWei.toString(),
                        token === zeroAddress ? wethAddress : token,
                        farm.zapper_addr
                    );
                    zapperTxn = await awaitTransaction(
                        client.wallet.sendTransaction({
                            to: farm.zapper_addr,
                            value: amountInWei,
                            data: encodeFunctionData({
                                abi: clipperZapperAbi,
                                functionName: "zapInETH",
                                args: [
                                    farm.vault_addr,
                                    0n,
                                    finalConfig.packedInput,
                                    finalConfig.packedConfig,
                                    finalConfig.r,
                                    finalConfig.s,
                                ],
                            }),
                        }),
                        client,
                        async (hash) => {
                            store.dispatch(
                                editTransactionStepDb({
                                    transactionId: id,
                                    stepType: TransactionTypes.ZAP_IN,
                                    status: TransactionStepStatus.IN_PROGRESS,
                                    txHash: hash,
                                })
                            );
                        }
                    );
                    store.dispatch(
                        editTransactionStepDb({
                            transactionId: id,
                            stepType: TransactionTypes.ZAP_IN,
                            status: TransactionStepStatus.COMPLETED,
                        })
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
                let {
                    status: bridgeStatus,
                    isBridged,
                    finalAmountToDeposit,
                } = await bridgeIfNeededLayerZero({
                    getPublicClient,
                    getWalletClient,
                    notificationId: id,
                    balances,
                    currentWallet,
                    toChainId: farm.chainId,
                    toToken: token,
                    toTokenAmount: amountInWei,
                    max,
                });
                if (bridgeStatus) {
                    if (isBridged) amountInWei = finalAmountToDeposit;
                    // #region Approve
                    // first approve tokens, if zap is not in eth
                    if (token !== zeroAddress) {
                        notifyLoading(loadingMessages.approvingZapping(), { id });
                        store.dispatch(
                            addTransactionStepDb({
                                transactionId: id!,
                                step: {
                                    type: TransactionTypes.APPROVE_ZAP,
                                    status: TransactionStepStatus.IN_PROGRESS,
                                } as ApproveZapStep,
                            })
                        );
                        const response = await approveErc20(
                            token,
                            farm.zapper_addr,
                            amountInWei,
                            currentWallet,
                            farm.chainId,
                            getPublicClient,
                            getWalletClient
                        );
                        store.dispatch(
                            editTransactionStepDb({
                                transactionId: id,
                                stepType: TransactionTypes.APPROVE_ZAP,
                                status: TransactionStepStatus.COMPLETED,
                            })
                        );
                        if (!response.status) throw new Error("Error approving vault!");
                    }
                    // #endregion
                    store.dispatch(
                        addTransactionStepDb({
                            transactionId: id!,
                            step: {
                                type: TransactionTypes.ZAP_IN,
                                amount: amountInWei.toString(),
                                status: TransactionStepStatus.IN_PROGRESS,
                            } as ZapInStep,
                        })
                    );
                    const { packedConfig, packedInput, r, s } = await createClipperData(
                        amountInWei.toString(),
                        token === zeroAddress ? wethAddress : token,
                        farm.zapper_addr
                    );
                    notifyLoading(loadingMessages.zapping(), { id });
                    const walletClient = await getWalletClient(farm.chainId);
                    zapperTxn = await awaitTransaction(
                        walletClient.sendTransaction({
                            to: farm.zapper_addr,
                            data: encodeFunctionData({
                                abi: clipperZapperAbi,
                                functionName: "zapIn",
                                args: [farm.vault_addr, 0n, packedInput, packedConfig, r, s],
                            }),
                        }),
                        { public: publicClient },
                        async (hash) => {
                            store.dispatch(
                                editTransactionStepDb({
                                    transactionId: id,
                                    stepType: TransactionTypes.ZAP_IN,
                                    status: TransactionStepStatus.IN_PROGRESS,
                                    txHash: hash,
                                })
                            );
                        }
                    );
                    store.dispatch(
                        editTransactionStepDb({
                            transactionId: id,
                            stepType: TransactionTypes.ZAP_IN,
                            status: TransactionStepStatus.COMPLETED,
                        })
                    );
                } else {
                    zapperTxn = {
                        status: false,
                        error: "Bridge Failed",
                    };
                }
            }

            if (!zapperTxn.status) {
                store.dispatch(markAsFailedDb(id));
                throw new Error(zapperTxn.error);
            } else {
                dismissNotify(id);
                notifySuccess(successMessages.zapIn());
            }
            // #endregion
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
            id && dismissNotify(id);
            store.dispatch(markAsFailedDb(id));
            notifyError(errorMessages.generalError(error.message || err.reason || err.message));
        }
    };

    const slippageIn: SlippageInBaseFn = async (args) => {
        let isBridged = false;
        let receviedAmt = 0n;

        let {
            amountInWei,
            balances,
            currentWallet,
            estimateTxGas,
            getPublicClient,
            decimals,
            prices,
            getWalletClient,
            token,
            max,
            tokenIn,
            farm,
            getClients,
        } = args;
        const publicClient = getPublicClient(farm.chainId);
        const wethAddress = addressesByChainId[farm.chainId].wethAddress;

        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            if (token !== zeroAddress) {
                const { balance } = getCombinedBalance(balances, farm.chainId, "usdc");
                amountInWei = BigInt(balance);
            } else {
                amountInWei = BigInt(balances[farm.chainId][token] ?? "0");
            }
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
            const { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
                getPublicClient,
                getWalletClient,
                balances,
                currentWallet,
                toChainId: farm.chainId,
                toToken: zeroAddress,
                toTokenAmount: amountInWei,
                max,
                simulate: true,
            });
            isBridged = amountToBeBridged > 0n;
            const { packedConfig, packedInput, r, s } = await createClipperData(
                afterBridgeBal.toString(),
                token === zeroAddress ? wethAddress : token,
                farm.zapper_addr
            );
            const populated = {
                data: encodeFunctionData({
                    abi: clipperZapperAbi,
                    functionName: "zapInETH",
                    args: [farm.vault_addr, 0n, packedInput, packedConfig, r, s],
                }),
                value: amountInWei,
            };

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        } else {
            const { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
                getPublicClient,
                getWalletClient,
                balances,
                currentWallet,
                toChainId: farm.chainId,
                toToken: token,
                toTokenAmount: amountInWei,
                max,
                simulate: true,
            });
            isBridged = amountToBeBridged > 0n;
            const { packedConfig, packedInput, r, s } = await createClipperData(
                afterBridgeBal.toString(),
                token === zeroAddress ? wethAddress : token,
                farm.zapper_addr
            );
            const populated = {
                data: encodeFunctionData({
                    abi: zapperAbi,
                    functionName: "zapIn",
                    args: [farm.vault_addr, 0n, packedInput, packedConfig, r, s],
                }),
            };

            transaction.input = populated.data || "";
        }
        console.log(transaction, farm);
        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.zapper_addr,
        });
        console.log({ simulationResult });
        const assetChanges = filterAssetChanges(farm.vault_addr, currentWallet, simulationResult.assetChanges);
        receviedAmt = assetChanges.difference;
        const zapAmount = Number(toEth(amountInWei, decimals[farm.chainId][token]));

        const afterTxAmount = Number(toEth(receviedAmt, farm.decimals)) * prices[farm.chainId][farm.vault_addr];
        const beforeTxAmount = zapAmount * prices[farm.chainId][token];
        let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
        if (slippage < 0) slippage = 0;
        return { receviedAmt, isBridged, afterTxAmount, beforeTxAmount, slippage };
    };

    const zapIn: ZapInFn = (props) => zapInClipperBase({ ...props, farm });
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

export default clipper;

const createClipperData = async (tokenAmountWei: string, depositTokenAddress: string, zapperAddr: string) => {
    const response = await backendApi.post<{
        packedInput: string;
        packedConfig: string;
        r: Hex;
        s: Hex;
        extraData: {
            tokenAddress: string;
            tokenAmountWei: string;
            goodUntil: number;
            poolTokens: string;
            v: number;
        };
    }>("/clipper/generate-deposit", { sender: zapperAddr, tokenAmountWei, depositTokenAddress });
    return {
        ...response.data,
        packedInput: BigInt(response.data.packedInput),
        packedConfig: BigInt(response.data.packedConfig),
    };
};
