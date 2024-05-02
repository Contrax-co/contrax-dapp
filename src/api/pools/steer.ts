import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { constants, BigNumber, Contract } from "ethers";
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
    filterStateDiff,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
} from "../tenderly";
import { isGasSponsored } from "..";
import { zapOutBase, slippageOut } from "./common";
import merge from "lodash.merge";

let steer = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[constants.AddressZero];
        const vaultTokenPrice = prices[farm.vault_addr];
        const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
        const zapCurriences = farm.zap_currencies;

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(balances[usdcAddress]!, decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(balances[usdcAddress]!, decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: toEth(balances[constants.AddressZero]!, 18),
                amountDollar: (Number(toEth(balances[constants.AddressZero]!, 18)) * ethPrice).toString(),
                price: ethPrice,
            },
        ];

        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[usdcAddress],
                isPrimaryVault: true,
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: ethPrice,
            },
        ];

        const result = {
            depositableAmounts,
            withdrawableAmounts,
            vaultBalanceFormated: (Number(toEth(vaultTotalSupply ?? 0)) * vaultTokenPrice).toString(),
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
        signer,
        chainId,
        max,
        tokenIn,
        prices,
        decimals,
    }) => {
        if (!signer) return;
        const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
        const wethAddress = addressesByChainId[chainId].wethAddress;
        let zapperTxn;
        let notiId;
        try {
            //#region Select Max
            if (max) {
                amountInWei = balances[token] ?? "0";
            }
            amountInWei = BigNumber.from(amountInWei);

            //#region Token Amounts
            const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);
            const steerVaultTokens: string[] = await vaultContract.steerVaultTokens();
            const getTotalAmounts: BigNumber[] = await vaultContract.getTotalAmounts();

            const token0Staked =
                prices![steerVaultTokens[0]] * Number(toEth(getTotalAmounts[0], decimals![steerVaultTokens[0]]));
            const token1Staked =
                prices![steerVaultTokens[1]] * Number(toEth(getTotalAmounts[1], decimals![steerVaultTokens[1]]));

            const token0Amount = amountInWei
                .mul(((token0Staked / (token0Staked + token1Staked)) * 10 ** 12).toFixed())
                .div(10 ** 12);
            const token1Amount = amountInWei.sub(token0Amount);
            //#endregion Token Amounts

            // #region Approve
            // first approve tokens, if zap is not in eth
            if (token !== constants.AddressZero) {
                notiId = notifyLoading(loadingMessages.approvingZapping());
                const response = await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, signer);
                if (!response.status) throw new Error("Error approving vault!");
                dismissNotify(notiId);
            }
            // #endregion

            // #region Zapping In
            notiId = notifyLoading(loadingMessages.zapping());

            // eth zap
            if (token === constants.AddressZero) {
                // use weth address as tokenId, but in case of some farms (e.g: hop)
                // we need the token of liquidity pair, so use tokenIn if provided
                token = tokenIn ?? wethAddress;

                //#region Gas Logic
                // if we are using zero dev, don't bother
                const connectorId = getConnectorId();
                if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                    const balance = BigNumber.from(balances[constants.AddressZero]);

                    const afterGasCut = await subtractGas(
                        amountInWei,
                        signer,
                        zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, token0Amount, token1Amount, {
                            value: balance,
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
                    zapperContract.zapInETH(farm.vault_addr, 0, token, token0Amount, token1Amount, {
                        value: amountInWei,
                    })
                );
            }
            // token zap
            else {
                const tx = zapperContract.populateTransaction.zapIn(
                    farm.vault_addr,
                    0,
                    token,
                    token0Amount,
                    token1Amount
                );

                zapperTxn = await awaitTransaction(
                    zapperContract.zapIn(farm.vault_addr, 0, token, token0Amount, token1Amount)
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
        let { amountInWei, balances, chainId, currentWallet, token, max, signer, tokenIn, farm, decimals, prices } =
            args;
        const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
        const wethAddress = addressesByChainId[chainId].wethAddress;

        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            amountInWei = balances[token] ?? "0";
        }
        amountInWei = BigNumber.from(amountInWei);

        //#region Token Amounts
        const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);
        const steerVaultTokens: string[] = await vaultContract.steerVaultTokens();
        const getTotalAmounts: BigNumber[] = await vaultContract.getTotalAmounts();

        const token0Staked =
            prices![steerVaultTokens[0]] * Number(toEth(getTotalAmounts[0], decimals![steerVaultTokens[0]]));
        const token1Staked =
            prices![steerVaultTokens[1]] * Number(toEth(getTotalAmounts[1], decimals![steerVaultTokens[1]]));

        const token0Amount = amountInWei
            .mul(((token0Staked / (token0Staked + token1Staked)) * 10 ** 12).toFixed())
            .div(10 ** 12);
        const token1Amount = amountInWei.sub(token0Amount);
        //#endregion Token Amounts
        if (token !== constants.AddressZero) {
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

        if (token === constants.AddressZero) {
            // use weth address as tokenId, but in case of some farms (e.g: hop)
            // we need the token of liquidity pair, so use tokenIn if provided
            token = tokenIn ?? wethAddress;

            //#region Gas Logic
            // if we are using zero dev, don't bother
            const connectorId = getConnectorId();
            // Check if max to subtract gas, cause we want simulations to work for amount which exceeds balance
            // And subtract gas won't work cause it estimates gas for tx, and tx will fail insufficent balance
            if ((connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) && max) {
                const balance = BigNumber.from(balances[constants.AddressZero]);
                const afterGasCut = await subtractGas(
                    amountInWei,
                    signer!,
                    zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token0Amount, token1Amount, {
                        value: balance,
                    })
                );
                if (!afterGasCut) return BigNumber.from(0);
                amountInWei = afterGasCut;
            }
            //#endregion
            const populated = await zapperContract.populateTransaction.zapInETH(
                farm.vault_addr,
                0,
                token,
                token0Amount,
                token1Amount,
                {
                    value: amountInWei,
                }
            );

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        } else {
            const populated = await zapperContract.populateTransaction.zapIn(
                farm.vault_addr,
                0,
                token,
                token0Amount,
                token1Amount
            );
            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        }
        console.log(transaction, farm);
        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.zapper_addr,
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
        return BigNumber.from(assetChanges.difference);
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
