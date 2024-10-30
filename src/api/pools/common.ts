import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, subtractGas, toEth } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import { SlippageInBaseFn, SlippageOutBaseFn, ZapInBaseFn, ZapOutBaseFn } from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { isGasSponsored } from "..";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import {
    filterAssetChanges,
    filterBalanceChanges,
    filterStateDiff,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
    traceTransactionAssetChange,
} from "../tenderly";
import merge from "lodash.merge";
import { Address, createPublicClient, encodeFunctionData, Hex, http, parseEventLogs, zeroAddress } from "viem";
import zapperAbi from "src/assets/abis/zapperAbi";
import { CrossChainBridgeWithdrawObject, CrossChainTransactionObject, IClients } from "src/types";
import { convertQuoteToRoute, getQuote, getStatus, LiFiStep } from "@lifi/sdk";
import { SupportedChains } from "src/config/walletConfig";
import store from "src/state";
import {
    ApproveBridgeStep,
    ApproveZapStep,
    BridgeService,
    GetBridgeQuoteStep,
    InitiateBridgeStep,
    TransactionStepStatus,
    TransactionTypes,
    WaitForBridgeResultsStep,
    ZapInStep,
    ZapOutStep,
} from "src/state/transactions/types";
import { buildTransaction, getBridgeStatus, getRoute, SocketApprovalData, SocketRoute } from "../bridge";
import {
    addTransactionStepDb,
    editTransactionStepDb,
    markAsFailedDb,
    TransactionsDB,
} from "src/state/transactions/transactionsReducer";
import { getWithdrawChainForFarm } from "../transaction";
import Bridge from "src/utils/Bridge";

export const zapInBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    isSocial,
    currentWallet,
    estimateTxGas,
    getClients,
    getWalletClient,
    max,
    id,
    getPublicClient,
    tokenIn,
}) => {
    const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;
    const publicClient = getPublicClient(farm.chainId);
    let zapperTxn;
    const TransactionsStep = new TransactionsDB(id);
    try {
        //#region Select Max
        if (max) {
            const { balance } = getCombinedBalance(balances, farm.chainId, token === zeroAddress ? "native" : "usdc");
            amountInWei = BigInt(balance);
        }
        //#endregion

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
                getWalletClient,
                getPublicClient,
                notificationId: id,
                balances: balances,
                currentWallet: currentWallet,
                toChainId: farm.chainId,
                toToken: zeroAddress,
                toTokenAmount: amountInWei,
                max: max,
            });
            if (bridgeStatus) {
                await TransactionsStep.addZapIn(amountInWei);
                const client = await getClients(farm.chainId);
                if (isBridged) amountInWei = finalAmountToDeposit;
                if (!isSocial && !(await isGasSponsored(currentWallet))) {
                    const afterGasCut = await subtractGas(
                        amountInWei,
                        { public: publicClient },
                        estimateTxGas({
                            to: farm.zapper_addr,
                            value: amountInWei,
                            chainId: farm.chainId,
                            data: encodeFunctionData({
                                abi: zapperAbi,
                                functionName: "zapInETH",
                                args: [farm.vault_addr, 0n, token],
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
                zapperTxn = await awaitTransaction(
                    client.wallet.sendTransaction({
                        to: farm.zapper_addr,
                        value: amountInWei,
                        data: encodeFunctionData({
                            abi: zapperAbi,
                            functionName: "zapInETH",
                            args: [farm.vault_addr, 0n, token],
                        }),
                    }),
                    client,
                    async (hash) => {
                        await TransactionsStep.zapIn(TransactionStepStatus.IN_PROGRESS, hash);
                    }
                );
                await TransactionsStep.zapIn(TransactionStepStatus.COMPLETED);
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
                    await TransactionsStep.addApproveZap();
                    const response = await approveErc20(
                        token,
                        farm.zapper_addr as Address,
                        amountInWei,
                        currentWallet,
                        farm.chainId,
                        getPublicClient,
                        getWalletClient
                    );
                    await TransactionsStep.approveZap(TransactionStepStatus.COMPLETED);

                    if (!response.status) throw new Error("Error approving vault!");
                }
                // #endregion
                await TransactionsStep.addZapIn(amountInWei);

                notifyLoading(loadingMessages.zapping(), { id });
                const client = await getClients(farm.chainId);

                zapperTxn = await awaitTransaction(
                    client.wallet.sendTransaction({
                        to: farm.zapper_addr,
                        data: encodeFunctionData({
                            abi: zapperAbi,
                            functionName: "zapIn",
                            args: [farm.vault_addr, 0n, token, amountInWei],
                        }),
                    }),
                    client,
                    async (hash) => {
                        await TransactionsStep.zapIn(TransactionStepStatus.IN_PROGRESS, hash);
                    }
                );
                await TransactionsStep.zapIn(TransactionStepStatus.COMPLETED);
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
        // #endregionbn
    } catch (error: any) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        id && dismissNotify(id);
        store.dispatch(markAsFailedDb(id));
        notifyError(errorMessages.generalError(error.message || err.reason || err.message));
    }
};

export const zapOutBase: ZapOutBaseFn = async ({
    farm,
    amountInWei,
    getPublicClient,
    getWalletClient,
    token,
    currentWallet,
    getClients,
    max,
    id,
}) => {
    notifyLoading(loadingMessages.approvingWithdraw(), { id });
    const TransactionsStep = new TransactionsDB(id);

    try {
        await TransactionsStep.addApproveZap();
        const client = await getClients(farm.chainId);
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);

        //#region Approve
        if (
            !(
                await approveErc20(
                    farm.vault_addr,
                    farm.zapper_addr,
                    vaultBalance,
                    currentWallet,
                    farm.chainId,
                    getPublicClient,
                    getWalletClient
                )
            ).status
        )
            throw new Error("Error approving vault!");

        if (
            !(
                await approveErc20(
                    farm.lp_address,
                    farm.zapper_addr,
                    vaultBalance,
                    currentWallet,
                    farm.chainId,
                    getPublicClient,
                    getWalletClient
                )
            ).status
        )
            throw new Error("Error approving lp!");

        await TransactionsStep.approveZap(TransactionStepStatus.COMPLETED);

        dismissNotify(id);
        //#endregion

        //#region Zapping Out
        notifyLoading(loadingMessages.withDrawing(), { id });

        let withdrawTxn: Awaited<ReturnType<typeof awaitTransaction>>;
        if (max) {
            amountInWei = vaultBalance;
        }
        await TransactionsStep.addZapOut(amountInWei);
        if (token === zeroAddress) {
            withdrawTxn = await awaitTransaction(
                client.wallet.sendTransaction({
                    to: farm.zapper_addr,
                    data: encodeFunctionData({
                        abi: zapperAbi,
                        functionName: "zapOutAndSwapEth",
                        args: [farm.vault_addr, max ? vaultBalance : amountInWei, 0n],
                    }),
                }),
                client,
                async (hash) => {
                    await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, hash);
                }
            );
        } else {
            withdrawTxn = await awaitTransaction(
                client.wallet.sendTransaction({
                    to: farm.zapper_addr,
                    data: encodeFunctionData({
                        abi: zapperAbi,
                        functionName: "zapOutAndSwap",
                        args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
                    }),
                }),
                client,
                async (hash) => {
                    await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, hash);
                }
            );
        }
        await TransactionsStep.zapOut(TransactionStepStatus.COMPLETED);
        if (!withdrawTxn.status) {
            store.dispatch(markAsFailedDb(id));
            throw new Error(withdrawTxn.error);
        } else {
            // Bridge after zap out
            const chainToWithdrawOn = await getWithdrawChainForFarm(currentWallet, farm.id);
            if (chainToWithdrawOn !== farm.chainId) {
                const data = await traceTransactionAssetChange({
                    chainId: farm.chainId,
                    txHash: withdrawTxn.txHash as Hex,
                    walletAddress: currentWallet,
                    tokenAddress: token,
                });
                if (data?.difference && data.difference > 0n) {
                    const nativePrice = store.getState().prices.prices[farm.chainId][zeroAddress];
                    const bridge = new Bridge(
                        currentWallet,
                        farm.chainId,
                        token,
                        chainToWithdrawOn,
                        token === zeroAddress ? zeroAddress : addressesByChainId[chainToWithdrawOn].usdcAddress,
                        data.difference,
                        "",
                        getWalletClient,
                        nativePrice
                    );

                    //#region Approve
                    notifyLoading(loadingMessages.withdrawBridgeStep(1, 3), {
                        id,
                    });
                    await TransactionsStep.addApproveBridge();
                    await bridge.approve();
                    await TransactionsStep.approveBridge(TransactionStepStatus.COMPLETED);
                    //#endregion Approve

                    //#region Initialize
                    notifyLoading(loadingMessages.withdrawBridgeStep(2, 3), {
                        id,
                    });
                    await TransactionsStep.addInitiateBridge(bridge.fromTokenAmount);
                    const txHash = await bridge.initialize();
                    await TransactionsStep.initiateBridge(TransactionStepStatus.COMPLETED);
                    //#endregion Initialize

                    //#region WaitForBridge
                    notifyLoading(loadingMessages.withdrawBridgeStep(3, 3), {
                        id,
                    });
                    await TransactionsStep.addWaitForBridge({
                        bridgeService: BridgeService.LAYER_ZERO,
                        txHash: txHash,
                        fromChain: bridge.fromChainId,
                        toChain: bridge.toChainId,
                        beforeBridgeBalance: bridge.fromTokenAmount.toString(),
                    });
                    await bridge.waitAndGetDstAmt();
                    await TransactionsStep.waitForBridge(TransactionStepStatus.COMPLETED);
                    //#endregion WaitForBridge
                }
            }
            dismissNotify(id);
            notifySuccess(successMessages.withdraw());
        }
        //#endregion
    } catch (error: any) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        dismissNotify(id);
        store.dispatch(markAsFailedDb(id));
        notifyError(errorMessages.generalError(error.message || err.reason || err.message));
    }
};

export const slippageIn: SlippageInBaseFn = async (args) => {
    let isBridged = false;
    let {
        amountInWei,
        balances,
        currentWallet,
        getPublicClient,
        prices,
        decimals,
        estimateTxGas,
        token,
        max,
        getWalletClient,
        getClients,
        tokenIn,
        farm,
    } = args;
    const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;
    let receviedAmt = 0n;

    const transaction = {} as Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >;
    transaction.from = currentWallet;

    if (max) {
        const { balance } = getCombinedBalance(balances, farm.chainId, token === zeroAddress ? "native" : "usdc");
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
        const populated = {
            data: encodeFunctionData({
                abi: zapperAbi,
                functionName: "zapInETH",
                args: [farm.vault_addr, 0n, token],
            }),
            value: afterBridgeBal,
        };

        transaction.input = populated.data || "";
        transaction.value = populated.value?.toString();
    } else {
        const { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
            getWalletClient,
            getPublicClient,
            balances,
            currentWallet,
            toChainId: farm.chainId,
            toToken: token,
            toTokenAmount: amountInWei,
            max,
            simulate: true,
        });
        isBridged = amountToBeBridged > 0n;
        const populated = {
            data: encodeFunctionData({
                abi: zapperAbi,
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
    receviedAmt = assetChanges.difference;
    const zapAmount = Number(toEth(amountInWei, decimals[farm.chainId][token]));
    const afterTxAmount = Number(toEth(receviedAmt, farm.decimals)) * prices[farm.chainId][farm.vault_addr];
    const beforeTxAmount = zapAmount * prices[farm.chainId][token];
    let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
    if (slippage < 0) slippage = 0;

    return { receviedAmt, isBridged, afterTxAmount, beforeTxAmount, slippage };
};

export const slippageOut: SlippageOutBaseFn = async ({
    getPublicClient,
    farm,
    token,
    max,
    amountInWei,
    currentWallet,
    decimals,
    prices,
}) => {
    let receviedAmt = 0n;
    const publicClient = getPublicClient(farm.chainId);
    const transaction = {} as Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >;
    transaction.from = currentWallet;
    const vaultBalance = await getBalance(farm.vault_addr, currentWallet, { public: publicClient });

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
            balance: max ? vaultBalance.toString() : amountInWei.toString(),
        })
    );
    //#endregion

    //#region Zapping Out

    if (token === zeroAddress) {
        const populated = {
            data: encodeFunctionData({
                abi: zapperAbi,
                functionName: "zapOutAndSwapEth",
                args: [farm.vault_addr, max ? vaultBalance : amountInWei, 0n],
            }),
        };

        transaction.input = populated.data || "";
    } else {
        const populated = {
            data: encodeFunctionData({
                abi: zapperAbi,
                functionName: "zapOutAndSwap",
                args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
            }),
        };
        transaction.input = populated.data || "";
    }
    //#endregion
    console.log(transaction, farm);
    const simulationResult = await simulateTransaction({
        /* Standard EVM Transaction object */
        ...transaction,
        to: farm.zapper_addr,
        chainId: farm.chainId,
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
    receviedAmt = difference;

    const withdrawAmt = Number(toEth(amountInWei, farm.decimals));

    const afterTxAmount = Number(toEth(receviedAmt, decimals[farm.chainId][token])) * prices[farm.chainId][token];
    const beforeTxAmount = withdrawAmt * prices[farm.chainId][farm.vault_addr];
    let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
    if (slippage < 0) slippage = 0;

    return { receviedAmt: difference, afterTxAmount, beforeTxAmount, slippage };
};

// export async function crossChainBridgeIfNecessary<T extends Omit<CrossChainTransactionObject, "contractCall">>(
//     obj: T
// ): Promise<
//     T["simulate"] extends true
//         ? {
//               afterBridgeBal: bigint;
//               amountToBeBridged: bigint;
//               //   amountSentForBridging:bigint;
//               //   amountToGetFromBridging:bigint;
//               //   amountTotalAfterBridging:bigint;
//               //   amountWantedAfterBridging:bigint;
//           }
//         : {
//               status: boolean;
//               error?: string;
//               isBridged: boolean;
//               finalAmountToDeposit: bigint;
//           }
// > {
//     const chain = SupportedChains.find((item) => item.id === obj.toChainId);
//     if (!chain) throw new Error("chain not found");
//     const toPublicClient = createPublicClient({
//         chain: chain,
//         transport: http(),
//         batch: {
//             multicall: {
//                 batchSize: 4096,
//                 wait: 250,
//             },
//         },
//     }) as IClients["public"];

//     const toBal = await getBalance(obj.toToken, obj.currentWallet, { public: toPublicClient });
//     if (toBal < obj.toTokenAmount) {
//         /**
//          * @description toBalDiff is the amount of token that is needed after subtracting current balance on farm chain
//          */
//         const toBalDiff = obj.toTokenAmount - toBal;
//         const { chainBalances } = getCombinedBalance(
//             obj.balances,
//             obj.toChainId,
//             obj.toToken === zeroAddress ? "native" : "usdc"
//         );
//         const fromChainId = Object.entries(chainBalances).find(([key, value]) => {
//             if (value >= toBalDiff && Number(key) !== obj.toChainId) return true;
//             return false;
//         })?.[0];
//         if (!fromChainId) {
//             if (obj.simulate) {
//                 // @ts-ignore
//                 return { afterBridgeBal: BigInt(obj.toTokenAmount), amountToBeBridged: 0n };
//             } else throw new Error("Insufficient balance");
//         }
//         console.log("getting bridge quote");
//         let quote: LiFiStep;
//         if (obj.notificationId) notifyLoading(loadingMessages.gettingBridgeQuote(), { id: obj.notificationId });

//         if (true || obj.max) {
//             store.dispatch(
//                 addTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     step: {
//                         type: TransactionTypes.GET_BRIDGE_QUOTE,
//                         status: TransactionStepStatus.IN_PROGRESS,
//                     } as GetBridgeQuoteStep,
//                 })
//             );
//             quote = await getQuote({
//                 fromAddress: obj.currentWallet,
//                 fromChain: fromChainId,
//                 toChain: obj.toChainId,
//                 // @ts-ignore
//                 fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
//                 toToken: obj.toToken,
//                 fromAmount: toBalDiff.toString(),
//                 order: "RECOMMENDED",
//                 // @ts-ignore
//                 denyBridges: "hop",
//             });
//         } else {
//             // quote = await getContractCallsQuote({
//             //     fromAddress: obj.currentWallet,
//             //     fromChain: fromChainId,
//             //     toChain: obj.toChainId,
//             //     // @ts-ignore
//             //     fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
//             //     toToken: obj.toToken,
//             //     toAmount: toBalDiff.toString(),
//             //     // toAmount: obj.toTokenAmount.toString(),
//             //     // contractOutputsToken: obj.contractCall.outputTokenAddress,
//             //     contractCalls: [
//             //         // {
//             //         //     fromAmount: obj.toTokenAmount.toString(),
//             //         //     fromTokenAddress: obj.toToken,
//             //         //     toContractAddress: obj.contractCall.to,
//             //         //     toTokenAddress: obj.contractCall.outputTokenAddress,
//             //         //     toContractCallData: obj.contractCall.data,
//             //         //     toContractGasLimit: "2000000",
//             //         // },
//             //     ],
//             // });
//         }
//         const route = convertQuoteToRoute(quote);
//         console.log("route =>", route);
//         if (obj.simulate) {
//             let afterBridgeBal = BigInt(route.toAmount) + toBal;
//             if (afterBridgeBal > BigInt(obj.toTokenAmount)) afterBridgeBal = BigInt(obj.toTokenAmount);
//             // @ts-ignore
//             return { afterBridgeBal, amountToBeBridged: BigInt(route.fromAmount) };
//         }

//         let allStatus: boolean = false;
//         let i = 1;
//         let finalAmountToDeposit: bigint = 0n;
//         for await (const step of route.steps) {
//             const publicClient = obj.getPublicClient(step.transactionRequest!.chainId!);
//             if (obj.notificationId)
//                 notifyLoading(loadingMessages.bridgeStep(i, route.steps.length), { id: obj.notificationId });
//             const { data, from, gasLimit, gasPrice, to, value } = step.transactionRequest!;
//             const tokenBalance = await getBalance(
//                 obj.toToken === zeroAddress
//                     ? zeroAddress
//                     : addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
//                 obj.currentWallet,
//                 { public: publicClient }
//             );
//             if (tokenBalance < BigInt(step.estimate.fromAmount)) {
//                 throw new Error("Insufficient Balance");
//             }
//             store.dispatch(
//                 editTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     stepType: TransactionTypes.GET_BRIDGE_QUOTE,
//                     status: TransactionStepStatus.COMPLETED,
//                 })
//             );
//             if (obj.toToken !== zeroAddress) {
//                 await store.dispatch(
//                     addTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         step: {
//                             type: TransactionTypes.APPROVE_BRIDGE,
//                             status: TransactionStepStatus.IN_PROGRESS,
//                         } as ApproveBridgeStep,
//                     })
//                 );
//                 await approveErc20(
//                     addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
//                     step.estimate.approvalAddress as Address,
//                     BigInt(step.estimate.fromAmount),
//                     obj.currentWallet,
//                     step.transactionRequest!.chainId!,
//                     obj.getPublicClient,
//                     obj.getWalletClient
//                 );
//                 await store.dispatch(
//                     editTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         stepType: TransactionTypes.APPROVE_BRIDGE,
//                         status: TransactionStepStatus.COMPLETED,
//                     })
//                 );
//             }
//             const walletClient = await obj.getWalletClient(step.transactionRequest!.chainId!);
//             const transaction = walletClient.sendTransaction({
//                 data: data as Hex,
//                 gasLimit: gasLimit!,
//                 gasPrice: BigInt(gasPrice!),
//                 to: to as Address,
//                 value: BigInt(value!),
//             });
//             store.dispatch(
//                 addTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     step: {
//                         type: TransactionTypes.INITIATE_BRIDGE,
//                         amount: toBalDiff.toString(),
//                         status: TransactionStepStatus.IN_PROGRESS,
//                     } as InitiateBridgeStep,
//                 })
//             );
//             const res = await awaitTransaction(transaction, { public: publicClient });
//             if (!res.status) {
//                 throw new Error(res.error);
//             }
//             let status = "PENDING";
//             store.dispatch(
//                 editTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     stepType: TransactionTypes.INITIATE_BRIDGE,
//                     status: TransactionStepStatus.COMPLETED,
//                 })
//             );
//             store.dispatch(
//                 addTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     step: {
//                         type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                         status: TransactionStepStatus.IN_PROGRESS,
//                         bridgeInfo: {
//                             bridgeService: BridgeService.LIFI,
//                             txHash: res.txHash!,
//                             fromChain: step.action.fromChainId,
//                             toChain: step.action.toChainId,
//                             tool: step.tool,
//                             beforeBridgeBalance: toBal.toString(),
//                         },
//                     } as WaitForBridgeResultsStep,
//                 })
//             );
//             do {
//                 if (obj.notificationId) notifyLoading(loadingMessages.bridgeDestTxWait(), { id: obj.notificationId });
//                 try {
//                     const result = await getStatus({
//                         txHash: res.txHash!,
//                         fromChain: step.action.fromChainId,
//                         toChain: step.action.toChainId,
//                         bridge: step.tool,
//                     });
//                     // @ts-ignore
//                     if (result.status === "DONE" && result?.receiving?.amount) {
//                         finalAmountToDeposit = BigInt((result.receiving as any).amount) + toBal;
//                     }
//                     status = result.status;
//                 } catch (_) {}

//                 console.log(`Transaction status for ${res.txHash}:`, status);

//                 // Wait for a short period before checking the status again
//                 await new Promise((resolve) => setTimeout(resolve, 5000));
//             } while (status !== "DONE" && status !== "FAILED");

//             if (status === "DONE") {
//                 store.dispatch(
//                     editTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                         amount: (finalAmountToDeposit - toBal).toString(),
//                         status: TransactionStepStatus.COMPLETED,
//                     })
//                 );
//                 allStatus = true;
//             } else {
//                 store.dispatch(
//                     editTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                         status: TransactionStepStatus.FAILED,
//                     })
//                 );
//                 console.error(`Transaction ${res.txHash} failed`);
//                 allStatus = false;
//             }
//             i++;
//         }
//         if (allStatus) {
//             // @ts-ignore
//             return {
//                 status: true,
//                 isBridged: true,
//                 finalAmountToDeposit,
//             };
//         } else {
//             // @ts-ignore
//             return {
//                 status: false,
//                 error: "Target chain error",
//                 isBridged: true,
//             };
//         }
//     } else {
//         if (obj.simulate) {
//             // @ts-ignore
//             return {
//                 afterBridgeBal: BigInt(obj.toTokenAmount),
//                 amountToBeBridged: 0n,
//             };
//         } else {
//             // @ts-ignore
//             return { status: true };
//         }
//     }
// }

export async function bridgeIfNeededLayerZero<T extends Omit<CrossChainTransactionObject, "contractCall">>(
    obj: T
): Promise<
    T["simulate"] extends true
        ? {
              afterBridgeBal: bigint;
              amountToBeBridged: bigint;
          }
        : {
              status: boolean;
              error?: string;
              isBridged: boolean;
              finalAmountToDeposit: bigint;
          }
> {
    const chain = SupportedChains.find((item) => item.id === obj.toChainId);
    if (!chain) throw new Error("chain not found");
    const toPublicClient = createPublicClient({
        chain: chain,
        transport: http(),
        batch: {
            multicall: {
                batchSize: 4096,
                wait: 250,
            },
        },
    }) as IClients["public"];

    const toBal = await getBalance(obj.toToken, obj.currentWallet, { public: toPublicClient });
    if (toBal < obj.toTokenAmount) {
        /**
         * @description toBalDiff is the amount of token that is needed after subtracting current balance on farm chain
         */
        const toBalDiff = obj.toTokenAmount - toBal;
        const { chainBalances } = getCombinedBalance(
            obj.balances,
            obj.toChainId,
            obj.toToken === zeroAddress ? "native" : "usdc"
        );
        const fromChainId: number | undefined = Number(
            Object.entries(chainBalances).find(([key, value]) => {
                if (value >= toBalDiff && Number(key) !== obj.toChainId) return true;
                return false;
            })?.[0]
        );
        if (!fromChainId) {
            if (obj.simulate) {
                // @ts-ignore
                return { afterBridgeBal: BigInt(obj.toTokenAmount), amountToBeBridged: 0n };
            } else throw new Error("Insufficient balance");
        }

        const nativePrice = store.getState().prices.prices[fromChainId][zeroAddress];
        const bridge = new Bridge(
            obj.currentWallet,
            fromChainId,
            obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
            obj.toChainId,
            obj.toToken,
            toBalDiff,
            "",
            obj.getWalletClient,
            nativePrice
        );

        if (obj.simulate) {
            const { amountOut } = await bridge.estimateAmountOut();
            let afterBridgeBal = amountOut + toBal;
            if (afterBridgeBal > BigInt(obj.toTokenAmount)) afterBridgeBal = BigInt(obj.toTokenAmount);
            // @ts-ignore
            return { afterBridgeBal, amountToBeBridged: bridge.fromTokenAmount };
        }
        if (!obj.notificationId) throw new Error("Provide notification id!");
        const TransactionsStep = new TransactionsDB(obj.notificationId);
        let finalAmountToDeposit: bigint = 0n;

        //#region Approve
        notifyLoading(loadingMessages.bridgeStep(1, 3), {
            id: obj.notificationId,
        });
        await TransactionsStep.addApproveBridge();
        await bridge.approve();
        await TransactionsStep.approveBridge(TransactionStepStatus.COMPLETED);
        //#endregion Approve

        //#region Initialize
        notifyLoading(loadingMessages.bridgeStep(2, 3), {
            id: obj.notificationId,
        });
        await TransactionsStep.addInitiateBridge(bridge.fromTokenAmount);
        const txHash = await bridge.initialize();
        await TransactionsStep.initiateBridge(TransactionStepStatus.COMPLETED);
        //#endregion Initialize

        //#region WaitForBridge
        notifyLoading(loadingMessages.bridgeStep(3, 3), {
            id: obj.notificationId,
        });
        await TransactionsStep.addWaitForBridge({
            bridgeService: BridgeService.LAYER_ZERO,
            txHash: txHash,
            fromChain: bridge.fromChainId,
            toChain: bridge.toChainId,
            beforeBridgeBalance: bridge.fromTokenAmount.toString(),
        });
        const bridgeResult = await bridge.waitAndGetDstAmt();
        await TransactionsStep.waitForBridge(TransactionStepStatus.COMPLETED);
        //#endregion WaitForBridge

        if (bridgeResult) {
            finalAmountToDeposit = bridgeResult.receivedToken + toBal;
            // @ts-ignore
            return {
                status: true,
                isBridged: true,
                finalAmountToDeposit,
            };
        } else {
            // @ts-ignore
            return {
                status: false,
                error: "Target chain error",
                isBridged: true,
            };
        }
    } else {
        if (obj.simulate) {
            // @ts-ignore
            return {
                afterBridgeBal: BigInt(obj.toTokenAmount),
                amountToBeBridged: 0n,
            };
        } else {
            // @ts-ignore
            return { status: true };
        }
    }
}
