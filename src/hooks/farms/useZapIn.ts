import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DATA, FARM_ZAP_IN } from "src/config/constants/query";
import useFarmsBalances from "./useFarmsBalances";
import useFarmsTotalSupply from "./useFarmsTotalSupply";
import { queryClient } from "src/config/reactQuery";
import farmFunctions from "src/api/pools";

export interface ZapIn {
    ethZapAmount: number;
    max?: boolean;
}

const useZapIn = (farm: Farm) => {
    const { signer, currentWallet, refetchBalance, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const _zapIn = async ({ ethZapAmount, max }: ZapIn) => {
        const cb = async () => {
            refetchBalance();
            await queryClient.refetchQueries({
                queryKey: FARM_DATA(currentWallet, NETWORK_NAME, farm.id),
                type: "active",
                exact: true,
            });
        };
        await farmFunctions[farm.id].zapIn({ zapAmount: ethZapAmount, currentWallet, signer, chainId, max, cb });
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
