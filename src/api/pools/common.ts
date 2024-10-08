import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, subtractGas } from "src/utils/common";
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
} from "../tenderly";
import merge from "lodash.merge";
import { Address, createPublicClient, encodeFunctionData, Hex, http, zeroAddress } from "viem";
import zapperAbi from "src/assets/abis/zapperAbi";
import { CrossChainTransactionObject, IClients } from "src/types";
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
} from "src/state/transactions/transactionsReducer";

export const zapInBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    isSocial,
    currentWallet,
    estimateTxGas,
    getClients,
    max,
    id,
    getPublicClient,
    tokenIn,
}) => {
    const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;
    const publicClient = getPublicClient(farm.chainId);
    let zapperTxn;
    try {
        //#region Select Max
        if (max) {
            const { balance } = getCombinedBalance(balances, token === zeroAddress ? "eth" : "usdc");
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
            } = await crossChainBridgeIfNecessary({
                getClients: getClients,
                notificationId: id,
                balances: balances,
                currentWallet: currentWallet,
                toChainId: farm.chainId,
                toToken: zeroAddress,
                toTokenAmount: amountInWei,
                max: max,
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
                    const client = await getClients(farm.chainId);

                    const response = await approveErc20(
                        token,
                        farm.zapper_addr as Address,
                        amountInWei,
                        currentWallet,
                        client
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

export const zapOutBase: ZapOutBaseFn = async ({ farm, amountInWei, token, currentWallet, getClients, max, id }) => {
    notifyLoading(loadingMessages.approvingWithdraw(), { id });
    try {
        store.dispatch(
            addTransactionStepDb({
                transactionId: id!,
                step: {
                    type: TransactionTypes.APPROVE_ZAP,
                    status: TransactionStepStatus.IN_PROGRESS,
                } as ApproveZapStep,
            })
        );
        const client = await getClients(farm.chainId);
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);

        //#region Approve
        if (!(await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, client)).status)
            throw new Error("Error approving vault!");

        if (!(await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, client)).status)
            throw new Error("Error approving lp!");

        store.dispatch(
            editTransactionStepDb({
                transactionId: id,
                stepType: TransactionTypes.APPROVE_ZAP,
                status: TransactionStepStatus.COMPLETED,
            })
        );

        dismissNotify(id);
        //#endregion

        //#region Zapping Out
        notifyLoading(loadingMessages.withDrawing(), { id });

        let withdrawTxn;
        if (max) {
            amountInWei = vaultBalance;
        }
        store.dispatch(
            addTransactionStepDb({
                transactionId: id!,
                step: {
                    type: TransactionTypes.ZAP_OUT,
                    amount: amountInWei.toString(),
                    status: TransactionStepStatus.IN_PROGRESS,
                } as ZapOutStep,
            })
        );
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
                    store.dispatch(
                        editTransactionStepDb({
                            transactionId: id,
                            stepType: TransactionTypes.ZAP_OUT,
                            status: TransactionStepStatus.IN_PROGRESS,
                            txHash: hash,
                        })
                    );
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
                    store.dispatch(
                        editTransactionStepDb({
                            transactionId: id,
                            stepType: TransactionTypes.ZAP_OUT,
                            status: TransactionStepStatus.IN_PROGRESS,
                            txHash: hash,
                        })
                    );
                }
            );
        }
        store.dispatch(
            editTransactionStepDb({
                transactionId: id,
                stepType: TransactionTypes.ZAP_OUT,
                status: TransactionStepStatus.COMPLETED,
            })
        );
        if (!withdrawTxn.status) {
            store.dispatch(markAsFailedDb(id));

            throw new Error(withdrawTxn.error);
        } else {
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
    let {
        amountInWei,
        balances,
        currentWallet,
        getPublicClient,
        estimateTxGas,
        token,
        max,
        getClients,
        tokenIn,
        farm,
    } = args;
    const publicClient = getPublicClient(farm.chainId);
    const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;

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
        const { afterBridgeBal, amountToBeBridged } = await crossChainBridgeIfNecessary({
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
    return assetChanges.difference;
};

export const slippageOut: SlippageOutBaseFn = async ({
    getPublicClient,
    farm,
    token,
    max,
    amountInWei,
    currentWallet,
}) => {
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

    return difference;
};

export async function crossChainBridgeIfNecessary<T extends Omit<CrossChainTransactionObject, "contractCall">>(
    obj: T
): Promise<
    T["simulate"] extends true
        ? {
              afterBridgeBal: bigint;
              amountToBeBridged: bigint;
              //   amountSentForBridging:bigint;
              //   amountToGetFromBridging:bigint;
              //   amountTotalAfterBridging:bigint;
              //   amountWantedAfterBridging:bigint;
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
        const toBalDiff = obj.toTokenAmount - toBal;
        const { chainBalances } = getCombinedBalance(obj.balances, obj.toToken === zeroAddress ? "eth" : "usdc");
        const fromChainId = Object.entries(chainBalances).find(([key, value]) => {
            if (value >= toBalDiff && Number(key) !== obj.toChainId) return true;
            return false;
        })?.[0];
        if (!fromChainId) {
            if (obj.simulate) {
                // @ts-ignore
                return { afterBridgeBal: BigInt(obj.toTokenAmount), amountToBeBridged: 0n };
            } else throw new Error("Insufficient balance");
        }
        console.log("getting bridge quote");
        let quote: LiFiStep;
        if (obj.notificationId) notifyLoading(loadingMessages.gettingBridgeQuote(), { id: obj.notificationId });

        if (true || obj.max) {
            store.dispatch(
                addTransactionStepDb({
                    transactionId: obj.notificationId!,
                    step: {
                        type: TransactionTypes.GET_BRIDGE_QUOTE,
                        status: TransactionStepStatus.IN_PROGRESS,
                    } as GetBridgeQuoteStep,
                })
            );
            quote = await getQuote({
                fromAddress: obj.currentWallet,
                fromChain: fromChainId,
                toChain: obj.toChainId,
                // @ts-ignore
                fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
                toToken: obj.toToken,
                fromAmount: toBalDiff.toString(),
                order: "RECOMMENDED",
                // @ts-ignore
                denyBridges: "hop",
            });
        } else {
            // quote = await getContractCallsQuote({
            //     fromAddress: obj.currentWallet,
            //     fromChain: fromChainId,
            //     toChain: obj.toChainId,
            //     // @ts-ignore
            //     fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
            //     toToken: obj.toToken,
            //     toAmount: toBalDiff.toString(),
            //     // toAmount: obj.toTokenAmount.toString(),
            //     // contractOutputsToken: obj.contractCall.outputTokenAddress,
            //     contractCalls: [
            //         // {
            //         //     fromAmount: obj.toTokenAmount.toString(),
            //         //     fromTokenAddress: obj.toToken,
            //         //     toContractAddress: obj.contractCall.to,
            //         //     toTokenAddress: obj.contractCall.outputTokenAddress,
            //         //     toContractCallData: obj.contractCall.data,
            //         //     toContractGasLimit: "2000000",
            //         // },
            //     ],
            // });
        }
        const route = convertQuoteToRoute(quote);
        console.log("route =>", route);
        if (obj.simulate) {
            let afterBridgeBal = BigInt(route.toAmount) + toBal;
            if (afterBridgeBal > BigInt(obj.toTokenAmount)) afterBridgeBal = BigInt(obj.toTokenAmount);
            // @ts-ignore
            return { afterBridgeBal, amountToBeBridged: BigInt(route.fromAmount) };
        }

        let allStatus: boolean = false;
        let i = 1;
        let finalAmountToDeposit: bigint = 0n;
        for await (const step of route.steps) {
            if (obj.notificationId)
                notifyLoading(loadingMessages.bridgeStep(i, route.steps.length), { id: obj.notificationId });
            const client = await obj.getClients(step.transactionRequest!.chainId!);
            const { data, from, gasLimit, gasPrice, to, value } = step.transactionRequest!;
            const tokenBalance = await getBalance(
                obj.toToken === zeroAddress
                    ? zeroAddress
                    : addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
                obj.currentWallet,
                client
            );
            if (tokenBalance < BigInt(step.estimate.fromAmount)) {
                throw new Error("Insufficient Balance");
            }
            store.dispatch(
                editTransactionStepDb({
                    transactionId: obj.notificationId!,
                    stepType: TransactionTypes.GET_BRIDGE_QUOTE,
                    status: TransactionStepStatus.COMPLETED,
                })
            );
            if (obj.toToken !== zeroAddress) {
                await store.dispatch(
                    addTransactionStepDb({
                        transactionId: obj.notificationId!,
                        step: {
                            type: TransactionTypes.APPROVE_BRIDGE,
                            status: TransactionStepStatus.IN_PROGRESS,
                        } as ApproveBridgeStep,
                    })
                );
                await approveErc20(
                    addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
                    step.estimate.approvalAddress as Address,
                    BigInt(step.estimate.fromAmount),
                    obj.currentWallet,
                    client
                );
                await store.dispatch(
                    editTransactionStepDb({
                        transactionId: obj.notificationId!,
                        stepType: TransactionTypes.APPROVE_BRIDGE,
                        status: TransactionStepStatus.COMPLETED,
                    })
                );
            }
            const transaction = client.wallet.sendTransaction({
                data: data as Hex,
                gasLimit: gasLimit!,
                gasPrice: BigInt(gasPrice!),
                to: to as Address,
                value: BigInt(value!),
            });
            store.dispatch(
                addTransactionStepDb({
                    transactionId: obj.notificationId!,
                    step: {
                        type: TransactionTypes.INITIATE_BRIDGE,
                        amount: toBalDiff.toString(),
                        status: TransactionStepStatus.IN_PROGRESS,
                    } as InitiateBridgeStep,
                })
            );
            const res = await awaitTransaction(transaction, client);
            if (!res.status) {
                throw new Error(res.error);
            }
            let status = "PENDING";
            store.dispatch(
                editTransactionStepDb({
                    transactionId: obj.notificationId!,
                    stepType: TransactionTypes.INITIATE_BRIDGE,
                    status: TransactionStepStatus.COMPLETED,
                })
            );
            store.dispatch(
                addTransactionStepDb({
                    transactionId: obj.notificationId!,
                    step: {
                        type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
                        status: TransactionStepStatus.IN_PROGRESS,
                        bridgeInfo: {
                            bridgeService: BridgeService.LIFI,
                            txHash: res.txHash!,
                            fromChain: step.action.fromChainId,
                            toChain: step.action.toChainId,
                            tool: step.tool,
                            beforeBridgeBalance: toBal.toString(),
                        },
                    } as WaitForBridgeResultsStep,
                })
            );
            do {
                if (obj.notificationId) notifyLoading(loadingMessages.bridgeDestTxWait(), { id: obj.notificationId });
                try {
                    const result = await getStatus({
                        txHash: res.txHash!,
                        fromChain: step.action.fromChainId,
                        toChain: step.action.toChainId,
                        bridge: step.tool,
                    });
                    // @ts-ignore
                    if (result.status === "DONE" && result?.receiving?.amount) {
                        finalAmountToDeposit = BigInt((result.receiving as any).amount) + toBal;
                    }
                    status = result.status;
                } catch (_) {}

                console.log(`Transaction status for ${res.txHash}:`, status);

                // Wait for a short period before checking the status again
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } while (status !== "DONE" && status !== "FAILED");

            if (status === "DONE") {
                store.dispatch(
                    editTransactionStepDb({
                        transactionId: obj.notificationId!,
                        stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
                        amount: (finalAmountToDeposit - toBal).toString(),
                        status: TransactionStepStatus.COMPLETED,
                    })
                );
                allStatus = true;
            } else {
                store.dispatch(
                    editTransactionStepDb({
                        transactionId: obj.notificationId!,
                        stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
                        status: TransactionStepStatus.FAILED,
                    })
                );
                console.error(`Transaction ${res.txHash} failed`);
                allStatus = false;
            }
            i++;
        }
        if (allStatus) {
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
// export async function crossChainBridgeIfNecessarySocket<T extends Omit<CrossChainTransactionObject, "contractCall">>(
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
//         const toBalDiff = obj.toTokenAmount - toBal;
//         const { chainBalances } = getCombinedBalance(obj.balances, obj.toToken === zeroAddress ? "eth" : "usdc");
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
//         if (obj.notificationId) notifyLoading(loadingMessages.gettingBridgeQuote(), { id: obj.notificationId });
//         store.dispatch(
//             addTransactionStepDb({
//                 transactionId: obj.notificationId!,
//                 step: {
//                     type: TransactionTypes.GET_BRIDGE_QUOTE,
//                     status: TransactionStepStatus.IN_PROGRESS,
//                 } as GetBridgeQuoteStep,
//             })
//         );
//         const { route, approvalData } = await getRoute(
//             Number(fromChainId),
//             obj.toChainId,
//             obj.toToken === zeroAddress
//                 ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
//                 : addressesByChainId[Number(fromChainId)].usdcAddress,
//             obj.toToken === zeroAddress ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : obj.toToken,
//             toBalDiff.toString(),
//             obj.currentWallet
//         );

//         if (obj.simulate) {
//             let afterBridgeBal = BigInt(route.toAmount) + toBal;
//             if (afterBridgeBal > BigInt(obj.toTokenAmount)) afterBridgeBal = BigInt(obj.toTokenAmount);
//             // @ts-ignore
//             return { afterBridgeBal, amountToBeBridged: BigInt(route.fromAmount) };
//         }
//         const buildTx = await buildTransaction(route);
//         if (!buildTx) throw new Error("Failed to build bridge transaction");

//         let finalAmountToDeposit: bigint = 0n;
//         if (obj.notificationId) notifyLoading(loadingMessages.bridgeStep(1, 1), { id: obj.notificationId });
//         const client = await obj.getClients(buildTx.chainId);
//         store.dispatch(
//             editTransactionStepDb({
//                 transactionId: obj.notificationId!,
//                 stepType: TransactionTypes.GET_BRIDGE_QUOTE,
//                 status: TransactionStepStatus.COMPLETED,
//             })
//         );
//         if (approvalData) {
//             store.dispatch(
//                 addTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     step: {
//                         type: TransactionTypes.APPROVE_BRIDGE,
//                         status: TransactionStepStatus.IN_PROGRESS,
//                     } as ApproveBridgeStep,
//                 })
//             );
//             await approveErc20(
//                 approvalData.approvalTokenAddress,
//                 buildTx.txTarget,
//                 BigInt(approvalData.minimumApprovalAmount),
//                 obj.currentWallet,
//                 client
//             );
//             store.dispatch(
//                 editTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     stepType: TransactionTypes.APPROVE_BRIDGE,
//                     status: TransactionStepStatus.COMPLETED,
//                 })
//             );
//         }
//         const transaction = client.wallet.sendTransaction({
//             data: buildTx.txData,
//             to: buildTx.txTarget,
//             value: BigInt(buildTx.value),
//         });
//         store.dispatch(
//             addTransactionStepDb({
//                 transactionId: obj.notificationId!,
//                 step: {
//                     type: TransactionTypes.INITIATE_BRIDGE,
//                     status: TransactionStepStatus.IN_PROGRESS,
//                 } as InitiateBridgeStep,
//             })
//         );
//         const res = await awaitTransaction(transaction, client);
//         if (!res.status) {
//             throw new Error(res.error);
//         }
//         let status = "PENDING";
//         store.dispatch(
//             editTransactionStepDb({
//                 transactionId: obj.notificationId!,
//                 stepType: TransactionTypes.INITIATE_BRIDGE,
//                 status: TransactionStepStatus.COMPLETED,
//             })
//         );
//         store.dispatch(
//             addTransactionStepDb({
//                 transactionId: obj.notificationId!,
//                 step: {
//                     type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                     status: TransactionStepStatus.IN_PROGRESS,
//                     bridgeInfo: {
//                         bridgeService: BridgeService.SOCKET_TECH,
//                         txHash: res.txHash!,
//                         fromChain: buildTx.chainId,
//                         toChain: obj.toChainId,
//                         beforeBridgeBalance: toBal.toString(),
//                     },
//                 } as WaitForBridgeResultsStep,
//             })
//         );
//         do {
//             if (obj.notificationId) notifyLoading(loadingMessages.bridgeDestTxWait(), { id: obj.notificationId });
//             try {
//                 const result = await getBridgeStatus(res.txHash!, buildTx.chainId, obj.toChainId);
//                 // @ts-ignore
//                 if (result.destinationTxStatus === "COMPLETED") {
//                     finalAmountToDeposit = BigInt(result.toAmount!) + toBal;
//                 }
//                 status = result.destinationTxStatus;
//             } catch (_) {}

//             console.log(`Transaction status for ${res.txHash}:`, status);

//             // Wait for a short period before checking the status again
//             await new Promise((resolve) => setTimeout(resolve, 5000));
//         } while (status !== "COMPLETED");

//         if (status === "COMPLETED") {
//             store.dispatch(
//                 editTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                     status: TransactionStepStatus.COMPLETED,
//                 })
//             );
//             // @ts-ignore
//             return {
//                 status: true,
//                 isBridged: true,
//                 finalAmountToDeposit,
//             };
//         } else {
//             store.dispatch(
//                 editTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                     status: TransactionStepStatus.FAILED,
//                 })
//             );
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
