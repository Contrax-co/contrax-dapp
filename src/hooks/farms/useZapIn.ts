import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DATA, FARM_ZAP_IN } from "src/config/constants/query";
import { queryClient } from "src/config/reactQuery";
import farmFunctions from "src/api/pools";
import useFarmDetails from "./useFarmDetails";
import useBalances from "../useBalances";

export interface ZapIn {
    ethZapAmount: number;
    max?: boolean;
}

const useZapIn = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances } = useBalances();

    const _zapIn = async ({ ethZapAmount, max }: ZapIn) => {
        await farmFunctions[farm.id].zapIn({ zapAmount: ethZapAmount, currentWallet, signer, chainId, max });
        reloadBalances();
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
