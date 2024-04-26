import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, toEth } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { addressesByChainId } from "src/config/constants/contracts";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    DynamicFarmFunctions,
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
import { defaultChainId } from "src/config/constants";
import { slippageIn, slippageOut, zapInBase, zapOutBase } from "./common";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import { filterAssetChanges, filterStateDiff, getAllowanceStateOverride, simulateTransaction } from "../tenderly";
import { encodeFunctionData, getContract, zeroAddress } from "viem";

let sushi: DynamicFarmFunctions = function (farmId) {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[zeroAddress];
        const lpAddress = farm.lp_address;
        const vaultTokenPrice = prices[farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.vault_addr] || 0);

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(BigInt(balances[usdcAddress]!), decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(BigInt(balances[usdcAddress]!), decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: toEth(BigInt(balances[zeroAddress]!), 18),
                amountDollar: (Number(toEth(BigInt(balances[zeroAddress]!), 18)) * ethPrice).toString(),
                price: ethPrice,
            },
            {
                tokenAddress: lpAddress,
                tokenSymbol: farm.name,
                amount: toEth(BigInt(balances[lpAddress]!), decimals[lpAddress]),
                amountDollar: (
                    Number(toEth(BigInt(balances[lpAddress]!), decimals[lpAddress])) * prices[lpAddress]
                ).toString(),
                price: prices[lpAddress],
            },
        ];

        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: ((Number(toEth(vaultBalance)) * vaultTokenPrice) / prices[usdcAddress]).toString(),
                amountDollar: (Number(toEth(vaultBalance)) * vaultTokenPrice).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance)) * vaultTokenPrice).toString(),
                price: ethPrice,
            },
            {
                tokenAddress: lpAddress,
                tokenSymbol: farm.name,
                amount: toEth(vaultBalance),
                amountDollar: (Number(toEth(vaultBalance)) * vaultTokenPrice).toString(),
                price: prices[lpAddress],
                isPrimaryVault: true,
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

    const deposit: DepositFn = async ({ amountInWei, currentWallet, client, chainId, max }) => {
        let notiId = notifyLoading(loadingMessages.approvingDeposit());
        try {
            const vaultContract = getContract({
                abi: farm.vault_abi,
                address: farm.vault_addr,
                client,
            });

            const lpBalance = await getBalance(farm.lp_address, currentWallet, client);

            // approve the vault to spend asset
            await approveErc20(farm.lp_address, farm.vault_addr, lpBalance, currentWallet, client);

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmDeposit(), { id: notiId });

            let depositTxn: any;
            if (max) {
                // @ts-ignore
                depositTxn = vaultContract.write.depositAll();
            } else {
                depositTxn = vaultContract.write.deposit([amountInWei]);
            }

            dismissNotify(notiId);
            notifyLoading(loadingMessages.depositing(depositTxn.transactionHash), {
                id: notiId,
                // buttons: [
                //     {
                //         name: "View",
                //         // @ts-ignore
                //         onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${depositTxn.hash}`, "_blank"),
                //     },
                // ],
            });

            depositTxn = await awaitTransaction(depositTxn, client);

            if (!depositTxn.status) {
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

    const withdraw: WithdrawFn = async ({ amountInWei, currentWallet, client, chainId, max }) => {
        const notiId = notifyLoading(loadingMessages.approvingWithdraw());
        try {
            const vaultContract = getContract({
                abi: farm.vault_abi,
                address: farm.vault_addr,
                client,
            });

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmingWithdraw(), { id: notiId });

            let withdrawTxn: any;
            if (max) {
                // @ts-ignore
                withdrawTxn = vaultContract.write.withdrawAll();
            } else {
                withdrawTxn = vaultContract.write.withdraw([amountInWei]);
            }

            dismissNotify(notiId);
            notifyLoading(loadingMessages.withDrawing(withdrawTxn.bundleTransactionHash), {
                id: notiId,
                // buttons: [
                //     {
                //         name: "View",
                //         // @ts-ignore
                //         onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${withdrawTxn.bundleTransactionHash}`, "_blank"),
                //     },
                // ],
            });

            withdrawTxn = await awaitTransaction(withdrawTxn, client);

            if (!withdrawTxn.status) {
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

    const depositSlippage: SlippageDepositBaseFn = async ({ amountInWei, currentWallet, farm, max, client }) => {
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
            const populated = {
                data: encodeFunctionData({
                    abi: farm.vault_abi,
                    functionName: "depositAll",
                    args: [],
                }),
                value: 0n,
            };

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        } else {
            const populated = {
                data: encodeFunctionData({
                    abi: farm.vault_abi,
                    functionName: "deposit",
                    args: [amountInWei],
                }),
                value: 0n,
            };

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        }
        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.vault_addr,
        });

        const filteredState = filterStateDiff(farm.vault_addr, "_balances", simulationResult.stateDiffs);
        const difference =
            BigInt(filteredState.afterChange[currentWallet.toLowerCase()]) -
            BigInt(filteredState.original[currentWallet.toLowerCase()]);

        return difference;
    };

    const withdrawSlippage: SlippageWithdrawBaseFn = async ({
        amountInWei,
        currentWallet,
        client,
        chainId,
        max,
        farm,
    }) => {
        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            const populated = {
                data: encodeFunctionData({
                    abi: farm.vault_abi,
                    functionName: "withdrawAll",
                    args: [],
                }),
                value: 0n,
            };

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        } else {
            const populated = {
                data: encodeFunctionData({
                    abi: farm.vault_abi,
                    functionName: "withdraw",
                    args: [amountInWei],
                }),
                value: 0n,
            };

            transaction.input = populated.data || "";
            transaction.value = populated.value?.toString();
        }

        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            ...transaction,
            to: farm.vault_addr,
        });

        const filteredState = filterStateDiff(farm.lp_address, "balanceOf", simulationResult.stateDiffs);
        const difference =
            BigInt(filteredState.afterChange[currentWallet.toLowerCase()]) -
            BigInt(filteredState.original[currentWallet.toLowerCase()]);

        return difference;
    };

    const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });
    const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, tokenIn: farm.token1, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
    const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

    return {
        getProcessedFarmData,
        deposit,
        withdraw,
        zapIn,
        zapOut,
        zapInSlippage,
        zapOutSlippage,
        depositSlippage,
        withdrawSlippage,
    };
};

export default sushi;
