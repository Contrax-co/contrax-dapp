import { useState, useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import * as ethers from "ethers";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_IN } from "src/config/constants/query";

export interface ZapIn {
    ethZapAmount: number;
}

const useZapIn = (farm: Farm) => {
    const { refetchBalance, provider, signer, currentWallet, balance } = useWallet();
    const { NETWORK_NAME, CONTRACTS } = useConstants();
    const [hash, setHash] = useState("");

    const _zapIn = async ({ ethZapAmount }: ZapIn) => {
        if (!provider || !signer || !farm) return;
        const zapperContract = new ethers.Contract(farm.zapper_addr, farm.zapper_abi, signer);

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
        const zapperTxnStatus = await zapperTxn.wait(1);
        if (!zapperTxnStatus.status) {
            setHash(zapperTxn.hash);
            throw new Error("Error zapping into vault!");
        } else {
            setHash(zapperTxn.hash);
            refetchBalance();
        }
    };

    const {
        mutate: zapIn,
        mutateAsync: zapInAsync,
        error: zapInError,
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

    const loaderMsg = useMemo(() => {
        if (isLoading) {
            return "Zapping in....";
        } else if (zapInError) {
            return "Error Zapping in!";
        } else if (status === "success") {
            return "Deposited--";
        } else {
            return "";
        }
    }, [isLoading, status, zapInError]);

    const secondaryMsg = useMemo(() => {
        if (zapInError) {
            return "Try again!";
        } else if (isLoading && !hash) {
            return "Approving zapping...";
        } else if (hash) {
            return `Txn hash: ${hash}`;
        } else {
            return "";
        }
    }, [zapInError, isLoading, hash]);

    return { isLoading, zapIn, zapInAsync, hash, loaderMsg, secondaryMsg, status, zapInError };
};

export default useZapIn;
