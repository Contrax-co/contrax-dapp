import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, subtractGas, toEth } from "src/utils/common";
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
} from "../tenderly";
import { isGasSponsored } from "..";
import { zapOutBase, slippageOut, slippageIn, zapInBase, bridgeIfNeededLayerZero } from "./common";
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
    StateOverride,
    zeroAddress,
} from "viem";
import store from "src/state";
import { ApproveZapStep, TransactionStepStatus, TransactionTypes, ZapInStep } from "src/state/transactions/types";
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
        return {
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

    const redeem: StCoreFarmFunctions["redeem"] = async ({ currentWallet, getPublicClient, getWalletClient }) => {
        const publicClient = getPublicClient(farm.chainId);
        const bal = await getBalance(farm.vault_addr, currentWallet, { public: publicClient });
        const notiId = notifyLoading(loadingMessages.approving());
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
            notifyError(errorMessages.generalError("Error redeeming..."));
        }
        return res;
    };

    const slippageIn: SlippageInBaseFn = async (args) => {
        let { amountInWei, balances, currentWallet, token, max, getPublicClient, getWalletClient, farm, tokenIn } =
            args;
        const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;
        const publicClient = getPublicClient(farm.chainId);
        let isBridged = false;
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
                return { difference: vaultBalance, isBridged };
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
                return { difference: vaultBalance, isBridged };
            }

            // #endregionbn
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
        }
        return { difference: 0n, isBridged };
    };

    const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });
    const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
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
