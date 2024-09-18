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
import { crossChainBridgeIfNecessary, slippageIn, slippageOut, zapInBase, zapOutBase } from "./common";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import { filterAssetChanges, simulateTransaction } from "../tenderly";
import { isGasSponsored } from "..";
import { FarmType } from "src/types/enums";
import { encodeFunctionData, getContract, zeroAddress } from "viem";
import pools_json from "src/config/constants/pools_json";
import zapperAbi from "src/assets/abis/zapperAbi";
import store from "src/state";
import { TransactionStatus } from "src/state/transactions/types";
import { editTransactionDb } from "src/state/transactions/transactionsReducer";

const apAbi = [
    {
        inputs: [],
        name: "getAllAssets",
        outputs: [
            {
                components: [
                    { internalType: "address", name: "token", type: "address" },
                    { internalType: "uint256", name: "weighting", type: "uint256" },
                    { internalType: "uint256", name: "basePriceUSDX96", type: "uint256" },
                    { internalType: "address", name: "c1", type: "address" },
                    { internalType: "uint256", name: "q1", type: "uint256" },
                ],
                internalType: "struct IDecentralizedIndex.IndexAssetInfo[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;
let peapods = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr] || 0);
        const zapCurriences = farm.zap_currencies;
        const combinedUsdcBalance = getCombinedBalance(balances, "usdc");
        const combinedEthBalance = getCombinedBalance(balances, "eth");
        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;
        let isCrossChain = true;
        const usdcCurrentChainBalance = Number(toEth(combinedUsdcBalance.chainBalances[farm.chainId], 6));
        if (usdcCurrentChainBalance >= 100) isCrossChain = false;

        let depositableAmounts: TokenAmounts[] = [
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
                isPrimaryVault: true,
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: ethPrice,
            },
        ];
        if (farm.token_type === FarmType.normal) {
            depositableAmounts.push({
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: combinedUsdcBalance.formattedBalance.toString(),
                amountDollar: combinedUsdcBalance.formattedBalance.toString(),
                price: prices[farm.chainId][usdcAddress],
            });
            withdrawableAmounts.push({
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(BigInt(vaultBalance), farm.decimals)) * vaultTokenPrice) /
                    prices[farm.chainId][usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(BigInt(vaultBalance), farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[farm.chainId][usdcAddress],
            });
        }

        zapCurriences?.forEach((currency) => {
            const currencyBalance = BigInt(balances[farm.chainId][currency.address] || 0);
            const currencyPrice = prices[farm.chainId][currency.address];
            depositableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: toEth(currencyBalance, decimals[farm.chainId][currency.address]),
                amountDollar: (
                    Number(toEth(currencyBalance, decimals[farm.chainId][currency.address])) * currencyPrice
                ).toString(),
                price: prices[farm.chainId][currency.address],
            });
            withdrawableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[farm.chainId][currency.address]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[farm.chainId][currency.address],
                isPrimaryVault: currency.symbol === farm.name,
            });
        });

        const result = {
            depositableAmounts,
            withdrawableAmounts,
            isCrossChain,
            vaultBalanceFormated: (Number(toEth(BigInt(vaultTotalSupply || 0))) * vaultTokenPrice).toString(),
            id: farm.id,
        };
        return result;
    };

    const zapInBaseLp: ZapInBaseFn = async ({
        farm,
        amountInWei,
        balances,
        estimateTxGas,
        token,
        currentWallet,
        getClients,
        id,
        isSocial,
        max,
        getPublicClient,
        tokenIn,
    }) => {
        const publicClient = getPublicClient(farm.chainId);
        let zapperTxn;
        try {
            //#region Select Max
            if (max) {
                const { balance } = getCombinedBalance(balances, token === zeroAddress ? "eth" : "usdc");
                amountInWei = BigInt(balance);
            }
            //#endregion

            const apContract = getContract({
                address: farm.token1,
                abi: apAbi,
                client: { public: publicClient },
            });

            const [{ token: tokenIn }] = await apContract.read.getAllAssets();

            // #region Zapping In
            notifyLoading(loadingMessages.zapping(), { id });

            // use weth address as tokenId, but in case of some farms (e.g: hop)
            // we need the token of liquidity pair, so use tokenIn if provided
            token = tokenIn;
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
                    (hash) => {
                        store.dispatch(editTransactionDb({ _id: id, txHash: hash, status: TransactionStatus.PENDING }));
                    }
                );
            } else {
                zapperTxn = {
                    status: false,
                    error: "Bridge Failed",
                };
            }

            if (!zapperTxn.status) {
                store.dispatch(editTransactionDb({ _id: id, status: TransactionStatus.FAILED }));
                throw new Error(zapperTxn.error);
            } else {
                store.dispatch(
                    editTransactionDb({ _id: id, txHash: zapperTxn.txHash, status: TransactionStatus.SUCCESS })
                );
                dismissNotify(id);
                notifySuccess(successMessages.zapIn());
            }
            // #endregion
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
            id && dismissNotify(id);
            store.dispatch(editTransactionDb({ _id: id, status: TransactionStatus.FAILED }));
            notifyError(errorMessages.generalError(error.message || err.reason || err.message));
        }
    };
    const slippageInLp: SlippageInBaseFn = async (args) => {
        let { amountInWei, balances, getPublicClient, currentWallet, estimateTxGas, token, max, getClients, farm } =
            args;
        const publicClient = getPublicClient(farm.chainId);
        const apContract = getContract({
            address: farm.token1,
            abi: apAbi,
            client: { public: publicClient },
        });

        const [{ token: tokenIn }] = await apContract.read.getAllAssets();
        console.log("tokenIn =>", tokenIn);
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

        transaction.balance_overrides = {
            [currentWallet]: amountInWei.toString(),
        };

        // use weth address as tokenId, but in case of some farms (e.g: hop)
        // we need the token of liquidity pair, so use tokenIn if provided
        token = tokenIn;

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
        console.log(transaction, farm);
        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.zapper_addr,
        });
        console.log({ simulationResult });
        const assetChanges = filterAssetChanges(farm.vault_addr, currentWallet, simulationResult.assetChanges);

        return assetChanges.difference;
    };

    const zapIn: ZapInFn = (props) =>
        farm.token_type === FarmType.normal ? zapInBase({ ...props, farm }) : zapInBaseLp({ ...props, farm });
    const zapInSlippage: SlippageInBaseFn = (props) =>
        farm.token_type === FarmType.normal ? slippageIn({ ...props, farm }) : slippageInLp({ ...props, farm });

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

export default peapods;
