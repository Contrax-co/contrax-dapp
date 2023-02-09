import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import * as ethers from "ethers";
import { Farm } from "src/types";
import useBalances from "../useBalances";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DEPOSIT } from "src/config/constants/query";
import useNotify from "src/hooks/useNotify";
import useFarmsBalances from "./useFarmsBalances";
import useFarmsTotalSupply from "./useFarmsTotalSupply";
import { validateNumberDecimals } from "src/utils/common";
import { useApprovalErc20 } from "../useApproval";

const useDeposit = (farm: Farm) => {
    const { provider, signer, currentWallet } = useWallet();
    const { NETWORK_NAME, BLOCK_EXPLORER_URL } = useConstants();
    const { notifySuccess, notifyLoading, notifyError, dismissNotify } = useNotify();
    const { approve } = useApprovalErc20();

    const { refetch: refetchBalances, balances } = useBalances([{ address: farm.lp_address, decimals: farm.decimals }]);
    const lpUserBal = useMemo(() => balances[farm.lp_address], [balances, farm.lp_address]);

    const { refetch: refetchVaultBalances } = useFarmsBalances();

    const { refetch: refetchVaultSupplies } = useFarmsTotalSupply();

    const _deposit = async ({ depositAmount, max }: { depositAmount: number; max?: boolean }) => {
        if (!provider) return;

        let notiId = notifyLoading("Approving deposit!", "Please wait...");
        try {
            const vaultContract = new ethers.Contract(farm.vault_addr, farm.vault_abi, signer);

            /*
             * Execute the actual deposit functionality from smart contract
             */
            let formattedBal;

            if (max) {
                // Deposit all
                formattedBal = lpUserBal;
            } else {
                // Deposit
                formattedBal = ethers.utils.parseUnits(
                    validateNumberDecimals(depositAmount, farm.decimals),
                    farm.decimals
                );
            }

            // approve the vault to spend asset
            await approve(farm.lp_address, farm.vault_addr, lpUserBal);

            dismissNotify(notiId);
            notifyLoading("Confirm Deposit!", "", { id: notiId });

            let depositTxn: any;
            if (max) {
                depositTxn = await vaultContract.depositAll();
            } else {
                depositTxn = await vaultContract.deposit(formattedBal);
            }

            dismissNotify(notiId);
            notifyLoading("Depositing...", `Txn hash: ${depositTxn.hash}`, {
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
                notifySuccess("Deposit!", "Successful");
                dismissNotify(notiId);
                refetchBalances();
            }
        } catch (error: any) {
            let err = JSON.parse(JSON.stringify(error));
            dismissNotify(notiId);
            notifyError("Error!", err.reason || err.message);
        }
        refetchVaultBalances();
        refetchVaultSupplies();
    };

    const {
        mutate: deposit,
        mutateAsync: depositAsync,
        status,
    } = useMutation({
        mutationFn: _deposit,
        mutationKey: FARM_DEPOSIT(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const depositInIsMutating = useIsMutating(FARM_DEPOSIT(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any deposit function is runnning
     */
    const isLoading = useMemo(() => {
        return depositInIsMutating > 0;
    }, [depositInIsMutating]);

    return { isLoading, depositAsync, status, deposit };
};

export default useDeposit;
