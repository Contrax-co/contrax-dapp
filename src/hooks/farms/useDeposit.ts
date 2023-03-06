import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { Farm } from "src/types";
import useBalances from "../useBalances";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DATA, FARM_DEPOSIT } from "src/config/constants/query";
import useFarmsBalances from "./useFarmsBalances";
import useFarmsTotalSupply from "./useFarmsTotalSupply";
import farmFunctions from "src/api/pools";
import { queryClient } from "src/config/reactQuery";

const useDeposit = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const _deposit = async ({ depositAmount, max }: { depositAmount: number; max?: boolean }) => {
        const cb = async () => {
            await queryClient.refetchQueries({
                queryKey: FARM_DATA(currentWallet, NETWORK_NAME, farm.id),
                type: "active",
                exact: true,
            });
        };
        await farmFunctions[farm.id].deposit({ depositAmount, currentWallet, signer, chainId, max, cb });
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
