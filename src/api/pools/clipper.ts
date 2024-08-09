import { approveErc20 } from "src/api/token";
import { awaitTransaction, getConnectorId, subtractGas, toEth } from "src/utils/common";
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
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
} from "../tenderly";
import { backendApi, isGasSponsored } from "..";
import { zapOutBase, slippageOut } from "./common";
import merge from "lodash.merge";
import { Address, encodeFunctionData, getContract, Hex, zeroAddress } from "viem";
import pools_json from "src/config/constants/pools_json";
import zapperAbi from "src/assets/abis/zapperAbi";
import clipperZapperAbi from "src/assets/abis/clipperZapperAbi";

let clipper = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr] || 0);
        const zapCurriences = farm.zap_currencies;

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(BigInt(balances[farm.chainId][usdcAddress]!), decimals[farm.chainId][usdcAddress]),
                amountDollar: (
                    Number(toEth(BigInt(balances[farm.chainId][usdcAddress]!), decimals[farm.chainId][usdcAddress])) *
                    prices[farm.chainId][usdcAddress]
                ).toString(),
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
        prices,
        decimals,
    }) => {
        const client = await getClients(farm.chainId);
        const zapperContract = getContract({
            address: farm.zapper_addr as Address,
            abi: clipperZapperAbi,
            client,
        });
        const wethAddress = addressesByChainId[farm.chainId].wethAddress;
        let zapperTxn;
        let notiId;
        try {
            //#region Select Max
            if (max) {
                amountInWei = BigInt(balances[farm.chainId][token] ?? "0");
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

            const { packedConfig, packedInput, r, s } = await createClipperData(
                amountInWei.toString(),
                token === zeroAddress ? wethAddress : token,
                farm.zapper_addr
            );
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
                                abi: clipperZapperAbi,
                                functionName: "zapInETH",
                                args: [farm.vault_addr, 0n, packedInput, packedConfig, r, s],
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
                    zapperContract.write.zapInETH([farm.vault_addr, 0n, packedInput, packedConfig, r, s], {
                        value: amountInWei,
                    }),
                    client
                );
            }
            // token zap
            else {
                zapperTxn = await awaitTransaction(
                    zapperContract.write.zapIn([farm.vault_addr, 0n, packedInput, packedConfig, r, s]),
                    client
                );
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
        let { amountInWei, balances, currentWallet, token, max, tokenIn, farm, getClients } = args;
        const client = await getClients(farm.chainId);
        const wethAddress = addressesByChainId[farm.chainId].wethAddress;

        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            amountInWei = BigInt(balances[farm.chainId][token] ?? "0");
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

        const { packedConfig, packedInput, r, s } = await createClipperData(
            amountInWei.toString(),
            token === zeroAddress ? wethAddress : token,
            farm.zapper_addr
        );
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
                const balance = BigInt(balances[farm.chainId][zeroAddress]!);
                const afterGasCut = await subtractGas(
                    amountInWei,
                    client,
                    client.wallet.estimateTxGas({
                        to: farm.zapper_addr,
                        value: balance,
                        data: encodeFunctionData({
                            abi: clipperZapperAbi,
                            functionName: "zapInETH",
                            args: [farm.vault_addr, 0n, packedInput, packedConfig, r, s],
                        }),
                    })
                );
                if (!afterGasCut) return BigInt(0);
                amountInWei = afterGasCut;
            }
            //#endregion
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
        return assetChanges.difference;
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
