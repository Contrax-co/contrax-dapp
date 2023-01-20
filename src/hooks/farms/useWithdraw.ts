import { Farm } from "src/types";
import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import * as ethers from "ethers";
import useNotify from "src/hooks/useNotify";
import useBalances from "../useBalances";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_WITHDRAW } from "src/config/constants/query";
import useFarmsVaultBalances from "./useFarmsVaultBalances";
import useFarmsVaultTotalSupply from "./useFarmsVaultTotalSupply";
import { validateNumberDecimals } from "src/utils/common";

const useWithdraw = (farm: Farm) => {
    const { provider, signer, currentWallet } = useWallet();
    const { NETWORK_NAME, BLOCK_EXPLORER_URL } = useConstants();
    const { notifySuccess, notifyLoading, notifyError, dismissNotify } = useNotify();
    const { formattedBalances, refetch: refetchVaultBalance } = useBalances([
        { address: farm.vault_addr, decimals: farm.decimals },
    ]);
    const userVaultBal = useMemo(() => formattedBalances[farm.vault_addr], [formattedBalances]);

    const { refetch: refetchVaultBalances } = useFarmsVaultBalances();

    const { refetch: refetchVaultSupplies } = useFarmsVaultTotalSupply();

    const _withdraw = async ({ withdrawAmount }: { withdrawAmount: number }) => {
        if (!provider || !signer || !farm) return;
        const notiId = notifyLoading("Approving Withdraw!", "Please wait...");
        try {
            const vaultContract = new ethers.Contract(farm.vault_addr, farm.vault_abi, signer);

            const gasPrice1: any = await provider.getGasPrice();

            /*
             * Execute the actual withdraw functionality from smart contract
             */
            let formattedBal;
            formattedBal = ethers.utils.parseUnits(
                validateNumberDecimals(withdrawAmount, farm.decimals),
                farm.decimals
            );
            dismissNotify(notiId);
            notifyLoading("Confirming Withdraw!", "Please wait...", { id: notiId });

            let withdrawTxn;
            try {
                if (withdrawAmount === userVaultBal) {
                    const gasEstimated: any = await vaultContract.estimateGas.withdrawAll();
                    const gasMargin = gasEstimated * 1.1;

                    withdrawTxn = await vaultContract.withdrawAll({ gasLimit: Math.ceil(gasMargin) });
                } else {
                    const gasEstimated: any = await vaultContract.estimateGas.withdraw(formattedBal);
                    const gasMargin = gasEstimated * 1.1;

                    withdrawTxn = await vaultContract.withdraw(formattedBal, { gasLimit: Math.ceil(gasMargin) });
                }
            } catch {
                if (withdrawAmount === userVaultBal) {
                    withdrawTxn = await vaultContract.withdrawAll({
                        gasLimit: gasPrice1 / 20,
                    });
                } else {
                    withdrawTxn = await vaultContract.withdraw(formattedBal, {
                        gasLimit: gasPrice1 / 20,
                    });
                }
            }

            dismissNotify(notiId);
            notifyLoading("Withdrawing...", `Txn hash: ${withdrawTxn.hash}`, {
                id: notiId,
                buttons: [
                    {
                        name: "View",
                        // @ts-ignore
                        onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${depositTxn.hash}`, "_blank"),
                    },
                ],
            });

            const withdrawTxnStatus = await withdrawTxn.wait(1);
            if (!withdrawTxnStatus.status) {
                throw new Error("Error withdrawing Try again!");
            } else {
                dismissNotify(notiId);
                notifySuccess("Withdrawn!", `successfully`);
                refetchVaultBalance();
            }
        } catch (error) {
            let err = JSON.parse(JSON.stringify(error));
            console.log(err);
            dismissNotify(notiId);
            notifyError("Error!", err.reason || err.message);
        }
        refetchVaultBalances();
        refetchVaultSupplies();
    };

    const {
        mutate: withdraw,
        mutateAsync: withdrawAsync,
        status,
    } = useMutation({
        mutationFn: _withdraw,
        mutationKey: FARM_WITHDRAW(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const withdrawIsMutating = useIsMutating(FARM_WITHDRAW(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any withdraw function is runnning
     */
    const isLoading = useMemo(() => {
        return withdrawIsMutating > 0;
    }, [withdrawIsMutating]);

    return { isLoading, withdraw, withdrawAsync, status };
};

export default useWithdraw;
