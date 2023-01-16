import { useState, useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import * as ethers from "ethers";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_IN } from "src/config/constants/query";
import useNotify from "src/hooks/useNotify";
import useFarmsVaultBalances from "./useFarmsVaultBalances";
import useFarmsVaultTotalSupply from "./useFarmsVaultTotalSupply";

export interface ZapIn {
    ethZapAmount: number;
}

const useZapIn = (farm: Farm) => {
    const { refetchBalance, provider, signer, currentWallet, balance } = useWallet();
    const { NETWORK_NAME, CONTRACTS, BLOCK_EXPLORER_URL } = useConstants();
    const { notifySuccess, notifyLoading, notifyError, dismissNotify } = useNotify();

    const { refetch: refetchVaultBalances } = useFarmsVaultBalances();

    const { refetch: refetchVaultSupplies } = useFarmsVaultTotalSupply();

    const _zapIn = async ({ ethZapAmount }: ZapIn) => {
        if (!provider || !signer || !farm) return;
        const zapperContract = new ethers.Contract(farm.zapper_addr, farm.zapper_abi, signer);
        let notiId = notifyLoading("Approving zapping!", "Please wait...");
        try {
            const gasPrice: any = await provider.getGasPrice();
            let formattedBal = ethers.utils.parseUnits(ethZapAmount.toString(), 18);

            // If the user is trying to zap in the exact amount of ETH they have, we need to remove the gas cost from the zap amount
            if (ethZapAmount === balance) {
                const gasToRemove = Number(ethers.utils.formatUnits(gasPrice, 11));
                formattedBal = ethers.utils.parseUnits((ethZapAmount - gasToRemove).toString(), 18);
            }

            let zapperTxn;
            try {
                const gasEstimated: any = await zapperContract.estimateGas.zapInETH(
                    farm.vault_addr,
                    0,
                    CONTRACTS.wethAddress,
                    {
                        value: formattedBal,
                    }
                );
                const gasMargin = gasEstimated * 1.1;

                zapperTxn = await zapperContract.zapInETH(farm.vault_addr, 0, CONTRACTS.wethAddress, {
                    value: formattedBal,
                    gasLimit: Math.ceil(gasMargin),
                });
            } catch {
                zapperTxn = await zapperContract.zapInETH(farm.vault_addr, 0, CONTRACTS.wethAddress, {
                    value: formattedBal,
                    gasLimit: gasPrice / 20,
                });
            }
            dismissNotify(notiId);
            notifyLoading("Zapping...", `Txn hash: ${zapperTxn.hash}`, {
                id: notiId,
                buttons: [
                    {
                        name: "View",
                        // @ts-ignore
                        onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${depositTxn.hash}`, "_blank"),
                    },
                ],
            });

            const zapperTxnStatus = await zapperTxn.wait(1);
            if (!zapperTxnStatus.status) {
                throw new Error("Error zapping into vault!");
            } else {
                dismissNotify(notiId);
                notifySuccess("Zapped in!", `Success`);
                refetchBalance();
            }
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
            dismissNotify(notiId);
            notifyError("Error!", err.reason || err.message);
        }
        refetchVaultBalances();
        refetchVaultSupplies();
    };

    const {
        mutate: zapIn,
        mutateAsync: zapInAsync,
        status,
    } = useMutation({
        mutationFn: _zapIn,
        mutationKey: FARM_ZAP_IN(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const zapInIsMutating = useIsMutating(FARM_ZAP_IN(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any zap function is runnning
     */
    const isLoading = useMemo(() => {
        return zapInIsMutating > 0;
    }, [zapInIsMutating]);

    return { isLoading, zapIn, zapInAsync, status };
};

export default useZapIn;
