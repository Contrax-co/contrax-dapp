import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_IN } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";

export interface ZapIn {
    zapAmount: number;
    max?: boolean;
    token: string;
}

const useZapIn = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances, balances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();

    const _zapIn = async ({ zapAmount, max, token }: ZapIn) => {
        await farmFunctions[farm.id].zapIn({ zapAmount, balances, signer, chainId, max, token });
        reloadBalances();
        reloadSupplies();
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
