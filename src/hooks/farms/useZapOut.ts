import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import * as ethers from "ethers";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_OUT } from "src/config/constants/query";
import useNotify from "src/hooks/useNotify";
import useBalances from "../useBalances";
import useFarmsVaultBalances from "./useFarmsVaultBalances";
import useFarmsVaultTotalSupply from "./useFarmsVaultTotalSupply";
import { validateNumberDecimals } from "src/utils/common";
import { useApprovalErc20 } from "../useApproval";

const useZapOut = (farm: Farm) => {
    const { provider, signer, currentWallet } = useWallet();
    const { NETWORK_NAME, CONTRACTS, BLOCK_EXPLORER_URL } = useConstants();
    const { notifySuccess, notifyLoading, notifyError, dismissNotify } = useNotify();
    const { refetch: refetchVaultBalance, balances } = useBalances([
        { address: farm.vault_addr, decimals: farm.decimals },
    ]);
    const vaultUserBalance = useMemo(() => balances[farm.vault_addr], [balances, farm.vault_addr]);
    const { approve } = useApprovalErc20();

    const { refetch: refetchVaultBalances } = useFarmsVaultBalances();

    const { refetch: refetchVaultSupplies } = useFarmsVaultTotalSupply();

    const _zapOut = async ({ withdrawAmt, max }: { withdrawAmt: number; max?: boolean }) => {
        if (!provider || !signer || !farm) return;
        const zapperContract = new ethers.Contract(farm.zapper_addr, farm.zapper_abi, signer);
        const notiId = notifyLoading("Approving Withdraw!", "Please wait...");
        try {
            /*
             * Execute the actual withdraw functionality from smart contract
             */
            let formattedBal;
            formattedBal = ethers.utils.parseUnits(validateNumberDecimals(withdrawAmt), farm.decimals || 18);

            await approve(farm.vault_addr, farm.zapper_addr, vaultUserBalance);
            await approve(farm.lp_address, farm.zapper_addr, vaultUserBalance);

            dismissNotify(notiId);
            notifyLoading("Confirming Withdraw!", "Please wait...", { id: notiId });

            let withdrawTxn = await zapperContract.zapOutAndSwap(
                farm.vault_addr,
                max ? vaultUserBalance : formattedBal,
                CONTRACTS.wethAddress,
                0
            );

            dismissNotify(notiId);
            notifyLoading("Withdrawing...", `Txn hash: ${withdrawTxn.hash}`, {
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
                notifySuccess("Withdrawn!", `successfully`);
                refetchVaultBalance();
            }
        } catch (error) {
            let err = JSON.parse(JSON.stringify(error));
            dismissNotify(notiId);
            notifyError("Error!", err.reason || err.message);
        }
        refetchVaultBalances();
        refetchVaultSupplies();
    };

    const {
        mutate: zapOut,
        mutateAsync: zapOutAsync,
        status,
    } = useMutation({
        mutationFn: _zapOut,
        mutationKey: FARM_ZAP_OUT(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const zapOutIsMutating = useIsMutating(FARM_ZAP_OUT(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any zap function is runnning
     */
    const isLoading = useMemo(() => {
        return zapOutIsMutating > 0;
    }, [zapOutIsMutating]);

    return { isLoading, zapOut, zapOutAsync, status };
};

export default useZapOut;
