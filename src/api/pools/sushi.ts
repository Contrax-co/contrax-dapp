import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, toEth } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
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
import pools_json from "src/config/constants/pools_json";
import vaultAbi from "src/assets/abis/vaultAbi";

let sushi: DynamicFarmFunctions = function (farmId) {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const lpAddress = farm.lp_address;
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr] || 0);
        const combinedUsdcBalance = getCombinedBalance(balances, "usdc");
        const combinedEthBalance = getCombinedBalance(balances, "eth");

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

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
                amount: combinedEthBalance.formattedBalance.toString(),
                amountDollar: (Number(combinedEthBalance.formattedBalance) * ethPrice).toString(),
                price: ethPrice,
            },
            {
                tokenAddress: lpAddress,
                tokenSymbol: farm.name,
                amount: toEth(BigInt(balances[farm.chainId][lpAddress]!), decimals[farm.chainId][lpAddress]),
                amountDollar: (
                    Number(toEth(BigInt(balances[farm.chainId][lpAddress]!), decimals[farm.chainId][lpAddress])) *
                    prices[farm.chainId][lpAddress]
                ).toString(),
                price: prices[farm.chainId][lpAddress],
            },
        ];

        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance)) * vaultTokenPrice) /
                    prices[farm.chainId][usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance)) * vaultTokenPrice).toString(),
                price: prices[farm.chainId][usdcAddress],
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
                price: prices[farm.chainId][lpAddress],
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

    const deposit: DepositFn = async ({ amountInWei, currentWallet, getClients, max }) => {
        let notiId = notifyLoading(loadingMessages.approvingDeposit());
        try {
            const client = await getClients(farm.chainId);
            const vaultContract = getContract({
                abi: vaultAbi,
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

    const withdraw: WithdrawFn = async ({ amountInWei, currentWallet, getClients, max }) => {
        const notiId = notifyLoading(loadingMessages.approvingWithdraw());
        try {
            const client = await getClients(farm.chainId);
            const vaultContract = getContract({
                abi: vaultAbi,
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

    const depositSlippage: SlippageDepositBaseFn = async ({ amountInWei, currentWallet, farm, max, getClients }) => {
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
                    abi: vaultAbi,
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
                    abi: vaultAbi,
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

    const withdrawSlippage: SlippageWithdrawBaseFn = async ({ amountInWei, currentWallet, max, farm }) => {
        const transaction = {} as Omit<
            TenderlySimulateTransactionBody,
            "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
        >;
        transaction.from = currentWallet;

        if (max) {
            const populated = {
                data: encodeFunctionData({
                    abi: vaultAbi,
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
                    abi: vaultAbi,
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
