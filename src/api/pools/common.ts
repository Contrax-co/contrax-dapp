import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, getConnectorId, subtractGas } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import { SlippageInBaseFn, SlippageOutBaseFn, ZapInBaseFn, ZapOutBaseFn } from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { web3AuthConnectorId } from "src/config/constants";
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
import {
    Address,
    createPublicClient,
    encodeFunctionData,
    getContract,
    Hex,
    http,
    TransactionReceipt,
    zeroAddress,
} from "viem";
import zapperAbi from "src/assets/abis/zapperAbi";
import { CrossChainTransactionObject, IClients } from "src/types";
import { convertQuoteToRoute, getContractCallsQuote, getQuote, getStatus, LiFiStep } from "@lifi/sdk";
import { SupportedChains } from "src/config/walletConfig";

export const zapInBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    currentWallet,
    estimateTxGas,
    getClients,
    max,
    getPublicClient,
    tokenIn,
}) => {
    const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;
    const publicClient = getPublicClient(farm.chainId);
    let zapperTxn;
    let notiId;
    try {
        //#region Select Max
        if (max) {
            if (token !== zeroAddress) {
                const { balance } = getCombinedBalance(balances, "usdc");
                amountInWei = BigInt(balance);
            } else {
                amountInWei = BigInt(balances[farm.chainId][token] ?? "0");
            }
        }
        //#endregion

        // #region Approve
        // first approve tokens, if zap is not in eth
        if (token !== zeroAddress) {
            notiId = notifyLoading(loadingMessages.approvingZapping());
            const client = await getClients(farm.chainId);
            const response = await approveErc20(token, farm.zapper_addr as Address, amountInWei, currentWallet, client);
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
            if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                const balance = BigInt(balances[farm.chainId][zeroAddress] || "0");
                const afterGasCut = await subtractGas(
                    amountInWei,
                    { public: publicClient },
                    estimateTxGas({
                        to: farm.zapper_addr,
                        chainId: farm.chainId,
                        value: balance,
                        data: encodeFunctionData({
                            abi: zapperAbi,
                            functionName: "zapInETH",
                            args: [farm.vault_addr, 0n, token],
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
            const client = await getClients(farm.chainId);
            zapperTxn = await awaitTransaction(
                client.wallet.writeContract({
                    address: farm.zapper_addr,
                    abi: zapperAbi,
                    functionName: "zapInETH",
                    args: [farm.vault_addr, 0n, token],
                    value: amountInWei,
                }),
                { public: publicClient }
            );
        }
        // token zap
        else {
            let { status: bridgeStatus, isBridged } = await crossChainBridgeIfNecessary({
                getClients,
                notificationId: notiId,
                balances,
                currentWallet,
                toChainId: farm.chainId,
                toToken: token,
                toTokenAmount: amountInWei,
                max,
            });
            if (bridgeStatus) {
                const client = await getClients(farm.chainId);
                if (isBridged) {
                    amountInWei = await getBalance(token, currentWallet, client);
                }
                notifyLoading(loadingMessages.zapping(), { id: notiId });
                zapperTxn = await awaitTransaction(
                    client.wallet.writeContract({
                        address: farm.zapper_addr,
                        abi: zapperAbi,
                        functionName: "zapIn",
                        args: [farm.vault_addr, 0n, token, amountInWei],
                    }),
                    client
                );
            } else {
                zapperTxn = {
                    status: false,
                    error: "Bridge Failed",
                };
            }
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

export const zapOutBase: ZapOutBaseFn = async ({ farm, amountInWei, token, currentWallet, getClients, max }) => {
    const client = await getClients(farm.chainId);
    const zapperContract = getContract({
        address: farm.zapper_addr as Address,
        abi: zapperAbi,
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
        if (token === zeroAddress) {
            withdrawTxn = await awaitTransaction(
                zapperContract.write.zapOutAndSwapEth([farm.vault_addr, max ? vaultBalance : amountInWei, 0n]),
                client
            );
        } else {
            withdrawTxn = await awaitTransaction(
                zapperContract.write.zapOutAndSwap([farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n]),
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
        if (token !== zeroAddress) {
            const { balance } = getCombinedBalance(balances, "usdc");
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

        //#region Gas Logic
        // if we are using zero dev, don't bother
        const connectorId = getConnectorId();
        if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
            const balance = BigInt(balances[farm.chainId][zeroAddress] || "0");

            const afterGasCut = await subtractGas(
                amountInWei,
                { public: publicClient },
                estimateTxGas({
                    to: farm.zapper_addr,
                    chainId: farm.chainId,
                    value: balance,
                    data: encodeFunctionData({
                        abi: zapperAbi,
                        functionName: "zapInETH",
                        args: [farm.vault_addr, 0n, token],
                    }),
                })
            );
            if (!afterGasCut) return 0n;
            amountInWei = afterGasCut;
        }
        //#endregion
        const populated = {
            data: encodeFunctionData({
                abi: zapperAbi,
                functionName: "zapInETH",
                args: [farm.vault_addr, 0n, token],
            }),
            value: amountInWei,
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

export const slippageOut: SlippageOutBaseFn = async ({ getClients, farm, token, max, amountInWei, currentWallet }) => {
    const client = await getClients(farm.chainId);
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
            quote = await getQuote({
                fromAddress: obj.currentWallet,
                fromChain: fromChainId,
                toChain: obj.toChainId,
                // @ts-ignore
                fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
                toToken: obj.toToken,
                fromAmount: toBalDiff.toString(),
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
        console.log("quote =>", quote);
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
            console.log("approving for bridge");
            if (obj.toToken !== zeroAddress) {
                await approveErc20(
                    addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
                    step.estimate.approvalAddress as Address,
                    BigInt(step.estimate.fromAmount),
                    obj.currentWallet,
                    client
                );
            }
            const transaction = client.wallet.sendTransaction({
                data: data as Hex,
                gasLimit: gasLimit!,
                gasPrice: BigInt(gasPrice!),
                to: to as Address,
                value: BigInt(value!),
            });
            console.log("doing transaction on source chain");
            const res = await awaitTransaction(transaction, client);
            console.log("res =>", res);
            if (!res.status) {
                throw new Error(res.error);
            }
            let status = "PENDING";
            do {
                if (obj.notificationId) notifyLoading(loadingMessages.bridgeDestTxWait(), { id: obj.notificationId });
                try {
                    const result = await getStatus({
                        txHash: res.txHash!,
                        fromChain: step.action.fromChainId,
                        toChain: step.action.toChainId,
                        bridge: step.tool,
                    });
                    status = result.status;
                } catch (_) {}

                console.log(`Transaction status for ${res.txHash}:`, status);

                // Wait for a short period before checking the status again
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } while (status !== "DONE" && status !== "FAILED");

            if (status === "DONE") {
                allStatus = true;
            } else {
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
// export const crossChainTransaction = async (
//     obj: CrossChainTransactionObject
// ): Promise<{
//     status: boolean;
//     error?: string;
// }> => {
//     console.time("bridge");
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
//         if (!fromChainId) throw new Error("Insufficient balance");
//         console.log("getting bridge quote");
//         let quote: LiFiStep;
//         if (obj.max) {
//             quote = await getQuote({
//                 fromAddress: obj.currentWallet,
//                 fromChain: fromChainId,
//                 toChain: obj.toChainId,
//                 // @ts-ignore
//                 fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
//                 toToken: obj.toToken,
//                 fromAmount: toBalDiff.toString(),
//             });
//         } else {
//             quote = await getContractCallsQuote({
//                 fromAddress: obj.currentWallet,
//                 fromChain: fromChainId,
//                 toChain: obj.toChainId,
//                 // @ts-ignore
//                 fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
//                 toToken: obj.toToken,
//                 toAmount: toBalDiff.toString(),
//                 // toAmount: obj.toTokenAmount.toString(),
//                 contractOutputsToken: obj.contractCall.outputTokenAddress,
//                 contractCalls: [
//                     // {
//                     //     fromAmount: obj.toTokenAmount.toString(),
//                     //     fromTokenAddress: obj.toToken,
//                     //     toContractAddress: obj.contractCall.to,
//                     //     toTokenAddress: obj.contractCall.outputTokenAddress,
//                     //     toContractCallData: obj.contractCall.data,
//                     //     toContractGasLimit: "2000000",
//                     // },
//                 ],
//             });
//         }
//         console.log("quote =>", quote);
//         const route = convertQuoteToRoute(quote);
//         console.log("route =>", route);
//         let allStatus: boolean = false;
//         for await (const step of route.steps) {
//             const client = await obj.getClients(step.transactionRequest!.chainId!);
//             const { data, from, gasLimit, gasPrice, to, value } = step.transactionRequest!;
//             const tokenBalance = await getBalance(
//                 obj.toToken === zeroAddress
//                     ? zeroAddress
//                     : addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
//                 obj.currentWallet,
//                 client
//             );
//             if (tokenBalance < BigInt(step.estimate.fromAmount)) {
//                 throw new Error("Insufficient Balance");
//             }
//             console.log("approving for bridge");
//             if (obj.toToken !== zeroAddress) {
//                 await approveErc20(
//                     addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
//                     step.estimate.approvalAddress as Address,
//                     BigInt(step.estimate.fromAmount),
//                     obj.currentWallet,
//                     client
//                 );
//             }
//             const transaction = client.wallet.sendTransaction({
//                 data: data as Hex,
//                 gasLimit: gasLimit!,
//                 gasPrice: BigInt(gasPrice!),
//                 to: to as Address,
//                 value: BigInt(value!),
//             });
//             console.log("doing transaction on source chain");
//             const res = await awaitTransaction(transaction, client);
//             console.log("res =>", res);
//             if (!res.status) {
//                 throw new Error(res.error);
//             }
//             let status: string;
//             do {
//                 const result = await getStatus({
//                     txHash: res.txHash!,
//                     fromChain: step.action.fromChainId,
//                     toChain: step.action.toChainId,
//                     bridge: step.tool,
//                 });
//                 status = result.status;

//                 console.log(`Transaction status for ${res.txHash}:`, status);

//                 // Wait for a short period before checking the status again
//                 await new Promise((resolve) => setTimeout(resolve, 5000));
//             } while (status !== "DONE" && status !== "FAILED");

//             if (status === "DONE") {
//                 allStatus = true;
//             } else {
//                 console.error(`Transaction ${res.txHash} failed`);
//                 allStatus = false;
//             }
//         }
//         if (allStatus) {
//             const client = await obj.getClients(obj.toChainId);
//             const transaction = client.wallet.sendTransaction({
//                 data: obj.contractCall.data,
//                 to: obj.contractCall.to,
//                 value: obj.contractCall.value,
//             });
//             console.log("performing transaction on destination chain");
//             const res = await awaitTransaction(transaction, client);
//             return res;
//         } else {
//             return {
//                 status: false,
//                 error: "Target chain error",
//             };
//         }
//     } else {
//         const client = await obj.getClients(obj.toChainId);
//         const transaction = client.wallet.sendTransaction({
//             data: obj.contractCall.data,
//             to: obj.contractCall.to,
//             value: obj.contractCall.value,
//         });
//         const res = await awaitTransaction(transaction, client);
//         return res;
//     }
//     console.timeEnd("bridge");
// };
