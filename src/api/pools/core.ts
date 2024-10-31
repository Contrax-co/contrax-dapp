import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, subtractGas, toEth, toWei } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { addressesByChainId } from "src/config/constants/contracts";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    FarmFunctions,
    GetFarmDataProcessedFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    StCoreFarmFunctions,
    TokenAmounts,
    ZapInBaseFn,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import {
    encodeStateOverrides,
    filterAssetChanges,
    filterStateDiff,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
    traceTransactionAssetChange,
} from "../tenderly";
import { isGasSponsored } from "..";
import { zapOutBase, zapInBase, bridgeIfNeededLayerZero } from "./common";
import merge from "lodash.merge";
import pools_json from "src/config/constants/pools_json";
import steerZapperAbi from "src/assets/abis/steerZapperAbi";
import {
    Address,
    encodeFunctionData,
    encodePacked,
    formatUnits,
    keccak256,
    numberToHex,
    parseEventLogs,
    parseUnits,
    StateOverride,
    zeroAddress,
} from "viem";
import store from "src/state";
import {
    ApproveZapStep,
    BridgeService,
    TransactionStepStatus,
    TransactionTypes,
    ZapInStep,
} from "src/state/transactions/types";
import {
    addTransactionStepDb,
    editTransactionDb,
    editTransactionStepDb,
    markAsFailedDb,
    TransactionsDB,
} from "src/state/transactions/transactionsReducer";
import zapperAbi from "src/assets/abis/zapperAbi";
import { SimulationParametersOverrides } from "@tenderly/sdk";
import { IClients } from "src/types";
import { Prices } from "src/state/prices/types";
import { getAllowanceSlot, getBalanceSlot } from "src/config/constants/storageSlots";
import { getWithdrawChainForFarm } from "../transaction";
import Bridge from "src/utils/Bridge";
import { CHAIN_ID } from "src/types/enums";

const EarnAbi = [
    {
        outputs: [
            { name: "unlockedAmount", internalType: "uint256", type: "uint256" },
            { name: "lockedAmount", internalType: "uint256", type: "uint256" },
        ],
        inputs: [{ name: "_account", internalType: "address", type: "address" }],
        name: "getRedeemAmount",
        stateMutability: "view",
        type: "function",
    },
    {
        outputs: [
            {
                components: [
                    { name: "redeemTime", internalType: "uint256", type: "uint256" },
                    { name: "unlockTime", internalType: "uint256", type: "uint256" },
                    { name: "amount", internalType: "uint256", type: "uint256" },
                    { name: "stCore", internalType: "uint256", type: "uint256" },
                    { name: "protocolFee", internalType: "uint256", type: "uint256" },
                ],
                name: "",
                internalType: "struct RedeemRecord[]",
                type: "tuple[]",
            },
        ],
        inputs: [{ name: "_account", internalType: "address", type: "address" }],
        name: "getRedeemRecords",
        stateMutability: "view",
        type: "function",
    },
] as const;

const ZapperAbi = [
    {
        inputs: [
            { indexed: true, name: "recipient", internalType: "address", type: "address" },
            { indexed: false, name: "amountOut", internalType: "uint256", type: "uint256" },
        ],
        name: "Withdraw",
        anonymous: false,
        type: "event",
    },
    {
        outputs: [{ name: "tokenBalance", internalType: "uint256", type: "uint256" }],
        inputs: [{ name: "vault", internalType: "contract IVault", type: "address" }],
        name: "zapOutAndSwap",
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        outputs: [{ name: "ethBalance", internalType: "uint256", type: "uint256" }],
        inputs: [{ name: "vault", internalType: "contract IVault", type: "address" }],
        name: "zapOutAndSwapEth",
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

let core = function (farmId: number): Omit<FarmFunctions & StCoreFarmFunctions, "deposit" | "withdraw"> {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr]);
        const zapCurriences = farm.zap_currencies;
        const combinedUsdcBalance = getCombinedBalance(balances, farm.chainId, "usdc");
        const combinedEthBalance = getCombinedBalance(balances, farm.chainId, "native");
        const usdcAddress = addressesByChainId[farm.chainId].usdcAddress;
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
            vaultBalanceFormated: (Number(toEth(BigInt(vaultTotalSupply ?? 0))) * vaultTokenPrice).toString(),
            id: farm.id,
            extraData: {} as any,
        };
        return result;
    };

    const fetchRedeemAndWithdraw: StCoreFarmFunctions["fetchRedeemAndWithdraw"] = async (args) => {
        const publicClient = args.getPublicClient(farm.chainId);
        const earnContract = "0xf5fA1728bABc3f8D2a617397faC2696c958C3409";
        const stakingAddr = await publicClient.readContract({
            address: farm.zapper_addr,
            abi: zapperAbi,
            functionName: "userStakingContracts",
            args: [args.currentWallet],
        });

        const [unlockedAmount, lockedAmount] = await publicClient.readContract({
            abi: EarnAbi,
            address: earnContract,
            functionName: "getRedeemAmount",
            args: [stakingAddr],
        });

        const redeemRecords = await publicClient.readContract({
            abi: EarnAbi,
            address: earnContract,
            functionName: "getRedeemRecords",
            args: [stakingAddr],
        });
        const unlockAmountDollar =
            Number(formatUnits(unlockedAmount, 18)) *
            args.prices[farm.chainId][addressesByChainId[farm.chainId].wethAddress];
        const lockAmountDollar =
            Number(formatUnits(lockedAmount, 18)) *
            args.prices[farm.chainId][addressesByChainId[farm.chainId].wethAddress];

        const vaultTokenPrice = args.prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(args.balances[farm.chainId][farm.vault_addr]);
        const stCoreDollar = Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice;

        const corePrice = args.prices[CHAIN_ID.CORE][addressesByChainId[CHAIN_ID.CORE].wethAddress];

        const coreDollar = stCoreDollar;
        const core = parseUnits((coreDollar / corePrice).toString(), 18);

        const totalCoreInvested = core + unlockedAmount + lockedAmount;
        const totalDollarInvested = coreDollar + unlockAmountDollar + lockAmountDollar;

        return {
            totalCoreInvested: totalCoreInvested.toString(),
            totalDollarInvested,
            unlockedAmount: unlockedAmount.toString(),
            unlockAmountDollar,
            lockAmountDollar,
            lockedAmount: lockedAmount.toString(),
            redeemRecords: redeemRecords.map((item) => ({
                redeemTime: item.redeemTime.toString(),
                unlockTime: item.unlockTime.toString(),
                amount: item.amount.toString(),
                amountDollar: Number(formatUnits(item.amount, 18)) * args.prices[farm.chainId][zeroAddress],
                stCore: item.stCore.toString(),
                stCoreDollar:
                    Number(formatUnits(item.stCore, 18)) *
                    args.prices[farm.chainId][addressesByChainId[farm.chainId].wethAddress],
                protocolFee: item.protocolFee.toString(),
            })),
        };
    };

    const redeem: StCoreFarmFunctions["redeem"] = async ({
        currentWallet,
        estimateTxGas,
        getPublicClient,
        getWalletClient,
    }) => {
        const publicClient = getPublicClient(farm.chainId);
        const notiId = notifyLoading(loadingMessages.approving());
        try {
            const bal = await getBalance(farm.vault_addr, currentWallet, { public: publicClient });
            await approveErc20(
                farm.vault_addr,
                farm.zapper_addr,
                bal,
                currentWallet,
                farm.chainId,
                getPublicClient,
                getWalletClient
            );
            notifyLoading(loadingMessages.redeeming(), { id: notiId });
            const walletClient = await getWalletClient(farm.chainId);
            await estimateTxGas({
                to: farm.zapper_addr,
                data: encodeFunctionData({
                    abi: zapperAbi,
                    functionName: "redeem",
                    args: [farm.vault_addr, bal],
                }),
                chainId: farm.chainId,
            });
            const res = await awaitTransaction(
                walletClient.writeContract({
                    address: farm.zapper_addr,
                    abi: zapperAbi,
                    functionName: "redeem",
                    args: [farm.vault_addr, bal],
                }),
                { public: publicClient }
            );
            dismissNotify(notiId);
            if (res.status) {
                notifySuccess(successMessages.redeem());
            } else {
                notifyError(errorMessages.generalError(res.error || "Error redeeming..."));
            }
            return res;
        } catch (error) {
            console.error(error);
            let err = JSON.parse(JSON.stringify(error));
            notifyError(errorMessages.generalError(err.shortMessage || error.message || err.reason || err.message));
            notiId && dismissNotify(notiId);
            return {
                status: false,
                error: error.message || err.reason || err.message,
                receipt: undefined,
                txHash: undefined,
            };
        }
    };

    const slippageIn: SlippageInBaseFn = async (args) => {
        let {
            amountInWei,
            balances,
            currentWallet,
            token,
            max,
            getPublicClient,
            decimals,
            prices,
            getWalletClient,
            farm,
            tokenIn,
        } = args;
        const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;
        const publicClient = getPublicClient(farm.chainId);
        let isBridged = false;
        let receviedAmt = 0n;

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
            //#endregion
            let stateOverrides: StateOverride = [];
            if (token !== zeroAddress) {
                stateOverrides.push({
                    address: token,
                    stateDiff: [
                        {
                            slot: getAllowanceSlot(farm.chainId, token, currentWallet, farm.zapper_addr),
                            value: numberToHex(amountInWei, { size: 32 }),
                        },
                        {
                            slot: getBalanceSlot(farm.chainId, token, currentWallet),
                            value: numberToHex(amountInWei, { size: 32 }),
                        },
                    ],
                });
            } else {
                stateOverrides.push({
                    address: currentWallet,
                    balance: amountInWei,
                });
            }
            // #region Zapping In

            // eth zap
            if (token === zeroAddress) {
                // use weth address as tokenId, but in case of some farms (e.g: hop)
                // we need the token of liquidity pair, so use tokenIn if provided
                token = tokenIn ?? wethAddress;

                const { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
                    getWalletClient,
                    getPublicClient,
                    simulate: true,
                    balances: balances,
                    currentWallet: currentWallet,
                    toChainId: farm.chainId,
                    toToken: zeroAddress,
                    toTokenAmount: amountInWei,
                    max: max,
                });
                isBridged = amountToBeBridged > 0n;

                if (isBridged) amountInWei = afterBridgeBal;

                const { result: vaultBalance } = await publicClient.simulateContract({
                    abi: zapperAbi,
                    functionName: "zapInETH",
                    args: [farm.vault_addr, 0n, token],
                    address: farm.zapper_addr,
                    account: currentWallet,
                    value: amountInWei,
                    stateOverride: stateOverrides,
                });
                receviedAmt = vaultBalance;
            }
            // token zap
            else {
                let { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
                    getPublicClient,
                    getWalletClient,
                    simulate: true,
                    balances,
                    currentWallet,
                    toChainId: farm.chainId,
                    toToken: token,
                    toTokenAmount: amountInWei,
                    max,
                });
                isBridged = amountToBeBridged > 0n;

                if (isBridged) amountInWei = afterBridgeBal;

                const { result: vaultBalance } = await publicClient.simulateContract({
                    abi: zapperAbi,
                    functionName: "zapIn",
                    args: [farm.vault_addr, 0n, token, amountInWei],
                    address: farm.zapper_addr,
                    account: currentWallet,
                    stateOverride: stateOverrides,
                });
                receviedAmt = vaultBalance;
            }

            // #endregionbn
        } catch (error: any) {
            console.log(error);
        }
        const zapAmount = Number(toEth(amountInWei, decimals[farm.chainId][token]));

        const afterTxAmount = Number(toEth(receviedAmt, farm.decimals)) * prices[farm.chainId][farm.vault_addr];
        const beforeTxAmount = zapAmount * prices[farm.chainId][token];
        let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
        if (slippage < 0) slippage = 0;

        return { receviedAmt: 0n, isBridged, slippage, beforeTxAmount, afterTxAmount };
    };

    const slippageOut: SlippageOutBaseFn = async ({
        getPublicClient,
        farm,
        token,
        prices,
        currentWallet,
        balances,
    }) => {
        if (!prices) throw new Error("Prices not found");
        const state = store.getState();
        const decimals = state.decimals.decimals;
        const publicClient = getPublicClient(farm.chainId);
        const { unlockAmountDollar, redeemRecords } = await fetchRedeemAndWithdraw({
            getPublicClient,
            currentWallet,
            prices,
            balances,
        });
        //#region Zapping Out
        let receivedAmtDollar = 0;
        let receviedAmt = 0n;
        if (token === zeroAddress) {
            const res = await publicClient.simulateContract({
                account: currentWallet,
                address: farm.zapper_addr,
                abi: ZapperAbi,
                functionName: "zapOutAndSwapEth",
                args: [farm.vault_addr],
            });

            receivedAmtDollar =
                Number(toEth(res.result, decimals[farm.chainId][zeroAddress])) * prices[farm.chainId][zeroAddress];

            receviedAmt = res.result;
        } else {
            const res = await publicClient.simulateContract({
                account: currentWallet,
                address: farm.zapper_addr,
                abi: ZapperAbi,
                functionName: "zapOutAndSwap",
                args: [farm.vault_addr],
            });
            receivedAmtDollar = Number(toEth(res.result, decimals[farm.chainId][token])) * prices[farm.chainId][token];

            receviedAmt = res.result;
        }
        const afterTxAmount = receivedAmtDollar;
        const beforeTxAmount = unlockAmountDollar;
        let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
        if (slippage < 0) slippage = 0;

        return { receviedAmt, slippage, afterTxAmount, beforeTxAmount };
        //#endregion
    };

    const zapOutBase: ZapOutFn = async ({
        amountInWei,
        currentWallet,
        estimateTxGas,
        getClients,
        getPublicClient,
        getWalletClient,
        id,
        isSocial,
        token,
        max,
        prices,
    }) => {
        notifyLoading(loadingMessages.withDrawing(), { id });
        const TransactionsStep = new TransactionsDB(id);

        try {
            const client = await getClients(farm.chainId);
            const vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);
            await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, amountInWei);

            //#region Zapping Out

            let withdrawTxn: Awaited<ReturnType<typeof awaitTransaction>>;

            if (token === zeroAddress) {
                withdrawTxn = await awaitTransaction(
                    client.wallet.sendTransaction({
                        to: farm.zapper_addr,
                        data: encodeFunctionData({
                            abi: ZapperAbi,
                            functionName: "zapOutAndSwapEth",
                            args: [farm.vault_addr],
                        }),
                    }),
                    client,
                    async (hash) => {
                        await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, amountInWei, hash);
                    }
                );
            } else {
                withdrawTxn = await awaitTransaction(
                    client.wallet.sendTransaction({
                        to: farm.zapper_addr,
                        data: encodeFunctionData({
                            abi: ZapperAbi,
                            functionName: "zapOutAndSwap",
                            args: [farm.vault_addr],
                        }),
                    }),
                    client,
                    async (hash) => {
                        await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, amountInWei, hash);
                    }
                );
            }
            await TransactionsStep.zapOut(TransactionStepStatus.COMPLETED, amountInWei);
            if (!withdrawTxn.status) {
                store.dispatch(markAsFailedDb(id));
                throw new Error(withdrawTxn.error);
            } else {
                // Bridge after zap out
                const chainToWithdrawOn = await getWithdrawChainForFarm(currentWallet, farm.id);
                if (chainToWithdrawOn !== farm.chainId) {
                    const logs = parseEventLogs({
                        logs: withdrawTxn.receipt!.logs,
                        abi: ZapperAbi,
                        eventName: "Withdraw",
                    });
                    const eventData = logs.find(
                        (item) => item.address.toLowerCase() === farm.zapper_addr.toLowerCase()
                    );
                    if (!eventData) throw new Error("Event data not found");
                    let amountOut = eventData.args.amountOut;
                    if (amountOut && amountOut > 0n) {
                        const nativePrice = store.getState().prices.prices[farm.chainId][zeroAddress];
                        const bridge = new Bridge(
                            currentWallet,
                            farm.chainId,
                            token,
                            chainToWithdrawOn,
                            token === zeroAddress ? zeroAddress : addressesByChainId[chainToWithdrawOn].usdcAddress,
                            amountOut,
                            "",
                            getWalletClient,
                            nativePrice
                        );

                        //#region Approve
                        notifyLoading(loadingMessages.withdrawBridgeStep(1, 3), {
                            id,
                        });
                        await TransactionsStep.approveBridge(TransactionStepStatus.IN_PROGRESS);
                        await bridge.approve();
                        await TransactionsStep.approveBridge(TransactionStepStatus.COMPLETED);
                        //#endregion Approve

                        //#region Initialize
                        notifyLoading(loadingMessages.withdrawBridgeStep(2, 3), {
                            id,
                        });
                        await TransactionsStep.initiateBridge(
                            TransactionStepStatus.IN_PROGRESS,
                            bridge.fromTokenAmount
                        );
                        const txHash = await bridge.initialize();
                        await TransactionsStep.initiateBridge(TransactionStepStatus.COMPLETED, bridge.fromTokenAmount);
                        //#endregion Initialize

                        //#region WaitForBridge
                        notifyLoading(loadingMessages.withdrawBridgeStep(3, 3), {
                            id,
                        });
                        await TransactionsStep.waitForBridge(TransactionStepStatus.IN_PROGRESS, {
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
    const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });
    const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props });
    const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

    return {
        getProcessedFarmData,
        zapIn,
        zapOut,
        redeem,
        fetchRedeemAndWithdraw,
        zapInSlippage,
        zapOutSlippage,
    };
};

export default core;
