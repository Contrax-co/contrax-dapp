import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, getConnectorId, subtractGas, toEth } from "src/utils/common";
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
import { zapOutBase, slippageOut, crossChainBridgeIfNecessary } from "./common";
import merge from "lodash.merge";
import pools_json from "src/config/constants/pools_json";
import steerZapperAbi from "src/assets/abis/steerZapperAbi";
import { encodeFunctionData, getContract, zeroAddress } from "viem";

let steer = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr]);
        const zapCurriences = farm.zap_currencies;
        const combinedUsdcBalance = getCombinedBalance(balances, "usdc");
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
                amount: toEth(BigInt(balances[farm.chainId][zeroAddress]!), 18),
                amountDollar: (Number(toEth(BigInt(balances[farm.chainId][zeroAddress]!), 18)) * ethPrice).toString(),
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
        currentWallet,
        max,
        tokenIn,
        getClients,
        prices,
        decimals,
    }) => {
        const client = await getClients(farm.chainId);
        const zapperContract = getContract({
            address: farm.zapper_addr,
            abi: steerZapperAbi,
            client,
        });

        const wethAddress = addressesByChainId[farm.chainId].wethAddress;
        let zapperTxn;
        let notiId;
        try {
            //#region Select Max
            if (max) {
                const { balance } = getCombinedBalance(balances, token === zeroAddress ? "eth" : "usdc");
                amountInWei = BigInt(balance);
            }

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
                if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                    const balance = BigInt(balances[farm.chainId][zeroAddress]);

                    const afterGasCut = await subtractGas(
                        amountInWei,
                        client,
                        client.wallet.estimateTxGas({
                            to: farm.zapper_addr,
                            value: balance,
                            data: encodeFunctionData({
                                abi: steerZapperAbi,
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

                zapperTxn = await awaitTransaction(
                    zapperContract.write.zapInETH([farm.vault_addr, 0n, token], {
                        value: amountInWei,
                    }),
                    client
                );

                // zapperTxn = await crossChainTransaction({
                //     getClients,
                //     balances,
                //     currentWallet,
                //     toChainId: farm.chainId,
                //     toToken: zeroAddress,
                //     toTokenAmount: amountInWei,
                //     max,
                //     contractCall: {
                //         outputTokenAddress: farm.vault_addr,
                //         value: amountInWei,
                //         to: farm.zapper_addr,
                //         data: encodeFunctionData({
                //             abi: steerZapperAbi,
                //             functionName: "zapInETH",
                //             args: [farm.vault_addr, 0n, token],
                //         }),
                //     },
                // });
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
                    if (isBridged) {
                        amountInWei = await getBalance(token, currentWallet, client);
                    }
                    notifyLoading(loadingMessages.zapping(), { id: notiId });

                    zapperTxn = await awaitTransaction(
                        zapperContract.write.zapIn([farm.vault_addr, 0n, token, amountInWei]),
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

    const slippageIn: SlippageInBaseFn = async (args) => {
        let { amountInWei, balances, currentWallet, token, max, getClients, tokenIn, farm, decimals, prices } = args;
        const client = await getClients(farm.chainId);
        const zapperContract = getContract({
            address: farm.zapper_addr,
            abi: steerZapperAbi,
            client,
        });
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
            //#region Gas Logic
            // if we are using zero dev, don't bother
            const connectorId = getConnectorId();
            // Check if max to subtract gas, cause we want simulations to work for amount which exceeds balance
            // And subtract gas won't work cause it estimates gas for tx, and tx will fail insufficent balance
            if ((connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) && max) {
                const balance = BigInt(balances[farm.chainId][zeroAddress]);
                const afterGasCut = await subtractGas(
                    amountInWei,
                    client,
                    client.wallet.estimateTxGas({
                        to: farm.zapper_addr,
                        value: balance,
                        data: encodeFunctionData({
                            abi: steerZapperAbi,
                            functionName: "zapInETH",
                            args: [farm.vault_addr, 0n, token],
                        }),
                    })
                );
                if (!afterGasCut) return BigInt(0);
                amountInWei = afterGasCut;
            }
            //#endregion
            const populated = {
                data: encodeFunctionData({
                    abi: steerZapperAbi,
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
