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
import { Address, encodeFunctionData, zeroAddress } from "viem";
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

let core = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
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
        };
        return result;
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
            let state_overrides: SimulationParametersOverrides | undefined = undefined;
            let balance_overrides: { [key: string]: string } | undefined = undefined;
            if (token !== zeroAddress) {
                state_overrides = getAllowanceStateOverride([
                    {
                        tokenAddress: token,
                        owner: currentWallet,
                        spender: farm.zapper_addr,
                    },
                ]);
                merge(
                    state_overrides,
                    getTokenBalanceStateOverride({
                        owner: currentWallet,
                        tokenAddress: token,
                        balance: amountInWei.toString(),
                    })
                );
            } else {
                balance_overrides = {
                    [currentWallet]: amountInWei.toString(),
                };
            }
            console.log("state_overrides =>", state_overrides);
            console.log("balance_overrides =>", balance_overrides);

            if (state_overrides) {
                const overrides = await encodeStateOverrides(state_overrides, farm.chainId);
                console.log("overrides =>", overrides);
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
        zapInSlippage,
        zapOutSlippage,
    };
};

export default core;
