import farmFunctions from "src/api/pools";
import { StCoreFarmFunctions } from "src/api/pools/types";
import useWallet from "../useWallet";
import { useMemo, useState } from "react";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_REDEEM, FARM_ZAP_IN } from "src/config/constants/query";

const farmId = 301;
const useStCoreRedeem = () => {
    const { currentWallet, getPublicClient, getWalletClient } = useWallet();
    const _redeem = async () => {
        if (!currentWallet) return;
        await (farmFunctions[farmId] as StCoreFarmFunctions).redeem({
            currentWallet,
            getPublicClient,
            getWalletClient,
        });
    };

    const {
        mutate: redeem,
        mutateAsync: redeemAsync,
        status,
    } = useMutation({
        mutationFn: _redeem,
        mutationKey: FARM_REDEEM(currentWallet!, farmId || 0),
    });

    const redeemIsMutating = useIsMutating({ mutationKey: FARM_REDEEM(currentWallet!, farmId) });

    /**
     * True if any zap function is runnning
     */
    const isLoading = useMemo(() => {
        return redeemIsMutating > 0;
    }, [redeemIsMutating]);

    return { isLoading, redeem: redeemAsync };
};

export default useStCoreRedeem;
