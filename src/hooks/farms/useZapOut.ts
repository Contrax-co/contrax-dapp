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

const useZapOut = (farm: Farm) => {
    const { provider, signer, currentWallet } = useWallet();
    const { NETWORK_NAME, CONTRACTS, BLOCK_EXPLORER_URL } = useConstants();
    const { notifySuccess, notifyLoading, notifyError, dismissNotify } = useNotify();
    const { refetch: refetchVaultBalance } = useBalances([{ address: farm.vault_addr, decimals: farm.decimals }]);

    const { refetch: refetchVaultBalances } = useFarmsVaultBalances();

    const { refetch: refetchVaultSupplies } = useFarmsVaultTotalSupply();

    const _zapOut = async ({ withdrawAmt }: { withdrawAmt: number }) => {
        if (!provider || !signer || !farm) return;
        const zapperContract = new ethers.Contract(farm.zapper_addr, farm.zapper_abi, signer);
        const notiId = notifyLoading("Approving Withdraw!", "Please wait...");
        try {
            /*
             * Execute the actual withdraw functionality from smart contract
             */
            let formattedBal;
            if (farm.decimals !== 18) {
                formattedBal = ethers.utils.parseUnits(withdrawAmt.toString(), farm.decimals);
            } else {
                formattedBal = ethers.utils.parseUnits(Number(withdrawAmt).toFixed(16), farm.decimals);
            }

            const vaultContract = new ethers.Contract(farm.vault_addr, farm.vault_abi, signer);
            await vaultContract.approve(farm.zapper_addr, formattedBal);

            const lpContract = new ethers.Contract(farm.lp_address, farm.lp_abi, signer);
            await lpContract.approve(farm.zapper_addr, formattedBal);

            const gasPrice: any = await provider.getGasPrice();

            dismissNotify(notiId);
            notifyLoading("Confirming Withdraw!", "Please wait...", { id: notiId });

            let withdrawTxn;
            try {
                const gasEstimated: any = await zapperContract.estimateGas.zapOutAndSwap(
                    farm.vault_addr,
                    formattedBal,
                    CONTRACTS.wethAddress,
                    0
                );
                const gasMargin = gasEstimated * 1.1;

                withdrawTxn = await zapperContract.zapOutAndSwap(
                    farm.vault_addr,
                    formattedBal,
                    CONTRACTS.wethAddress,
                    0,
                    {
                        gasLimit: Math.ceil(gasMargin),
                    }
                );
            } catch {
                withdrawTxn = await zapperContract.zapOutAndSwap(
                    farm.vault_addr,
                    formattedBal,
                    CONTRACTS.wethAddress,
                    0,
                    {
                        gasLimit: gasPrice / 20,
                    }
                );
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
