import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { BigNumber, Contract, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { toEth } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    GetFarmDataProcessedFn,
    SlippageDepositBaseFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    SlippageWithdrawBaseFn,
    TokenAmounts,
    WithdrawFn,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { defaultChainId } from "src/config/constants";
import { slippageIn, slippageOut, zapInBase, zapOutBase } from "./common";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import { filterAssetChanges, filterStateDiff, getAllowanceStateOverride, simulateTransaction } from "../tenderly";

const farm = pools.find((farm) => farm.id === 5) as Farm;

export const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
    const ethPrice = prices[constants.AddressZero];
    const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
    const vaultTokenPrice = prices[farm.token1];
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
            amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / prices[usdcAddress]).toString(),
            amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
            price: prices[usdcAddress],
        },
        {
            tokenAddress: constants.AddressZero,
            tokenSymbol: "ETH",
            amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
            amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
            price: ethPrice,
        },
    ];

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

    return {
        depositableAmounts,
        withdrawableAmounts,
        vaultBalanceFormated: (Number(toEth(vaultTotalSupply ?? 0, farm.decimals)) * vaultTokenPrice).toString(),
        id: farm.id,
    };
};

export const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });
export const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, tokenIn: farm.token1, farm });

export const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
export const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

export const deposit: DepositFn = async ({ amountInWei, currentWallet, signer, chainId, max }) => {
    if (!signer) return;
    let notiId = notifyLoading(loadingMessages.approvingDeposit());
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
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
        notifyLoading(loadingMessages.depositing(depositTxn.hash), {
            id: notiId,
            buttons: [
                {
                    name: "View",
                    // @ts-ignore
                    onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${depositTxn.hash}`, "_blank"),
                },
            ],
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

export const withdraw: WithdrawFn = async ({ amountInWei, currentWallet, signer, chainId, max }) => {
    if (!signer) return;
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
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
        notifyLoading(loadingMessages.withDrawing(withdrawTxn.hash), {
            id: notiId,
            buttons: [
                {
                    name: "View",
                    // @ts-ignore
                    onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${withdrawTxn.hash}`, "_blank"),
                },
            ],
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

export const depositSlippage: SlippageDepositBaseFn = async ({ farm, currentWallet, signer, amountInWei, max }) => {
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

export const withdrawSlippage: SlippageWithdrawBaseFn = async ({
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
    const { added, subtracted } = filterAssetChanges(farm.lp_address, currentWallet, simulationResult.assetChanges);
    const difference = BigNumber.from(added).sub(subtracted);

    return difference;
};
