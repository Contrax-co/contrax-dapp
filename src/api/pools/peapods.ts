import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { constants, BigNumber, Signer, Contract, utils } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getConnectorId, subtractGas, toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { addressesByChainId } from "src/config/constants/contracts";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    DynamicFarmFunctions,
    FarmFunctions,
    GetFarmDataProcessedFn,
    SlippageDepositBaseFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    SlippageWithdrawBaseFn,
    TokenAmounts,
    WithdrawFn,
    ZapInBaseFn,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { defaultChainId, web3AuthConnectorId } from "src/config/constants";
import { slippageIn, slippageOut, zapInBase, zapOutBase } from "./common";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import {
    filterAssetChanges,
    filterStateDiff,
    getAllowanceStateOverride,
    getTokenBalanceStateOverride,
    simulateTransaction,
} from "../tenderly";
import { isGasSponsored } from "..";
import { FarmType } from "src/types/enums";
import merge from "lodash.merge";

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
let peapods = function (farmId: number): FarmFunctions {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[constants.AddressZero];
        const vaultTokenPrice = prices[farm.vault_addr];
        const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
        const zapCurriences = farm.zap_currencies;

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
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
                isPrimaryVault: true,
                tokenAddress: constants.AddressZero,
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
                amount: toEth(balances[usdcAddress]!, decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(balances[usdcAddress]!, decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
                price: prices[usdcAddress],
            });
            withdrawableAmounts.push({
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[usdcAddress],
            });
        }

        zapCurriences?.forEach((currency) => {
            const currencyBalance = BigNumber.from(balances[currency.address]);
            const currencyPrice = prices[currency.address];
            depositableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: toEth(currencyBalance, decimals[currency.symbol]),
                amountDollar: (Number(toEth(currencyBalance, decimals[currency.address])) * currencyPrice).toString(),
                price: prices[currency.address],
            });
            withdrawableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[currency.address]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[currency.address],
                isPrimaryVault: currency.symbol === farm.name,
            });
        });

        const result = {
            depositableAmounts,
            withdrawableAmounts,
            vaultBalanceFormated: (Number(toEth(vaultTotalSupply ?? 0)) * vaultTokenPrice).toString(),
            id: farm.id,
        };
        return result;
    };
    const deposit: DepositFn = async ({ amountInWei, currentWallet, signer, max }) => {
        if (!signer) return;
        let notiId = notifyLoading(loadingMessages.approvingDeposit());
        try {
            const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

            const lpBalance = await getBalance(farm.lp_address, currentWallet, signer.provider!);

            // approve the vault to spend asset
            await approveErc20(farm.lp_address, farm.vault_addr, lpBalance, currentWallet, signer);

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmDeposit(), { id: notiId });

            let depositTxn: any;
            if (max) {
                depositTxn = await vaultContract.depositAll();
            } else {
                depositTxn = await vaultContract.deposit(amountInWei);
            }
            dismissNotify(notiId);
            notifyLoading(loadingMessages.depositing(depositTxn.transactionHash), {
                id: notiId,
            });

            const depositTxnStatus = await depositTxn.wait(1);
            if (!depositTxnStatus.status) {
                throw new Error("Error depositing into vault!");
            } else {
                notifySuccess(successMessages.deposit());
                dismissNotify(notiId);
            }
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
            dismissNotify(notiId);
            notifyError(errorMessages.generalError(err.reason || err.message));
        }
    };

    const withdraw: WithdrawFn = async ({ amountInWei, signer, max }) => {
        if (!signer) return;
        const notiId = notifyLoading(loadingMessages.approvingWithdraw());
        try {
            const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmingWithdraw(), { id: notiId });

            let withdrawTxn: any;
            if (max) {
                withdrawTxn = await vaultContract.withdrawAll();
            } else {
                withdrawTxn = await vaultContract.withdraw(amountInWei);
            }

            dismissNotify(notiId);
            notifyLoading(loadingMessages.withDrawing(withdrawTxn.bundleTransactionHash), {
                id: notiId,
            });

            const withdrawTxnStatus = await withdrawTxn.wait(1);
            if (!withdrawTxnStatus.status) {
                throw new Error("Error withdrawing Try again!");
            } else {
                dismissNotify(notiId);
                notifySuccess(successMessages.withdraw());
            }
        } catch (error) {
            let err = JSON.parse(JSON.stringify(error));
            console.log(err);
            dismissNotify(notiId);
            notifyError(errorMessages.generalError(err.reason || err.message));
        }
    };

    const depositSlippage: SlippageDepositBaseFn = async ({ amountInWei, currentWallet, farm, max, signer }) => {
        if (!signer) return BigNumber.from(0);
        const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        // approve the vault to spend asset
        transaction.state_overrides = getAllowanceStateOverride([
            {
                tokenAddress: farm.lp_address,
                owner: currentWallet,
                spender: farm.vault_addr,
            },
        ]);

        if (max) {
            const populated = await vaultContract.populateTransaction.depositAll();

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        } else {
            const populated = await vaultContract.populateTransaction.deposit(amountInWei);

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        }
        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.vault_addr,
        });

        const filteredState = filterStateDiff(farm.vault_addr, "_balances", simulationResult.stateDiffs);
        const difference = BigNumber.from(filteredState.afterChange[currentWallet.toLowerCase()]).sub(
            BigNumber.from(filteredState.original[currentWallet.toLowerCase()])
        );

        return difference;
    };

    const withdrawSlippage: SlippageWithdrawBaseFn = async ({
        amountInWei,
        currentWallet,
        signer,
        chainId,
        max,
        farm,
    }) => {
        if (!signer) return BigNumber.from(0);
        const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);
        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            const populated = await vaultContract.populateTransaction.withdrawAll();

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        } else {
            const populated = await vaultContract.populateTransaction.withdraw(amountInWei);

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        }

        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.vault_addr,
        });
        const filteredState = filterStateDiff(farm.lp_address, "balances", simulationResult.stateDiffs);
        const difference = BigNumber.from(filteredState.afterChange[currentWallet.toLowerCase()]).sub(
            BigNumber.from(filteredState.original[currentWallet.toLowerCase()])
        );

        return difference;
    };

    const zapInBaseLp: ZapInBaseFn = async ({
        farm,
        amountInWei,
        balances,
        token,
        currentWallet,
        signer,
        chainId,
        max,
        tokenIn,
    }) => {
        if (!signer) return;
        const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
        let zapperTxn;
        let notiId;
        try {
            //#region Select Max
            if (max) {
                amountInWei = balances[token] ?? "0";
            }
            amountInWei = BigNumber.from(amountInWei);
            //#endregion

            const apContract = new Contract(farm.token1, apAbi, signer);
            const [[tokenIn]] = await apContract.getAllAssets();

            // #region Zapping In
            notiId = notifyLoading(loadingMessages.zapping());

            // use weth address as tokenId, but in case of some farms (e.g: hop)
            // we need the token of liquidity pair, so use tokenIn if provided
            token = tokenIn;

            //#region Gas Logic
            // if we are using zero dev, don't bother
            const connectorId = getConnectorId();
            if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                const balance = BigNumber.from(balances[constants.AddressZero]);
                const afterGasCut = await subtractGas(
                    amountInWei,
                    signer,
                    zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
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
                zapperContract.zapInETH(farm.vault_addr, 0, token, {
                    value: amountInWei,
                })
            );

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
    const slippageInLp: SlippageInBaseFn = async (args) => {
        let { amountInWei, balances, chainId, currentWallet, token, max, signer, farm } = args;
        const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
        const apContract = new Contract(farm.token1, apAbi, signer);
        const [[tokenIn]] = await apContract.getAllAssets();
        console.log("tokenIn =>", tokenIn);
        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            amountInWei = balances[token] ?? "0";
        }
        amountInWei = BigNumber.from(amountInWei);

        transaction.balance_overrides = {
            [currentWallet]: amountInWei.toString(),
        };

        // use weth address as tokenId, but in case of some farms (e.g: hop)
        // we need the token of liquidity pair, so use tokenIn if provided
        token = tokenIn;

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
                zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
                    value: balance,
                })
            );
            if (!afterGasCut) return BigNumber.from(0);
            amountInWei = afterGasCut;
        }
        //#endregion

        const populated = await zapperContract.populateTransaction.zapInETH(farm.vault_addr, 0, token, {
            value: amountInWei,
        });

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

        return BigNumber.from(assetChanges.difference);
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
        depositSlippage,
        withdrawSlippage,
        deposit,
        withdraw,
    };
};

export default peapods;
