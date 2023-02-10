import { Farm } from "src/types";
import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import useBalances from "../useBalances";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_WITHDRAW } from "src/config/constants/query";
import useFarmsBalances from "./useFarmsBalances";
import useFarmsTotalSupply from "./useFarmsTotalSupply";
import farmFunctions from "src/api/pools";
import { queryClient } from "src/config/reactQuery";

const useWithdraw = (farm: Farm) => {
    const { refetch: refetchVaultBalance } = useBalances([{ address: farm.vault_addr, decimals: farm.decimals }]);
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const { refetch: refetchVaultBalances } = useFarmsBalances();

    const { refetch: refetchVaultSupplies } = useFarmsTotalSupply();

    const _withdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
        const cb = async () => {
            refetchVaultBalance();
            refetchVaultBalances();
            refetchVaultSupplies();
            // @ts-ignore
            await queryClient.refetchQueries(["farm", "data"], { active: true });
        };
        await farmFunctions[farm.id].withdraw({ withdrawAmount, currentWallet, signer, chainId, max, cb });
    };

    const {
        mutate: withdraw,
        mutateAsync: withdrawAsync,
        status,
    } = useMutation({
        mutationFn: _withdraw,
        mutationKey: FARM_WITHDRAW(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const withdrawIsMutating = useIsMutating(FARM_WITHDRAW(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any withdraw function is runnning
     */
    const isLoading = useMemo(() => {
        return withdrawIsMutating > 0;
    }, [withdrawIsMutating]);

    return { isLoading, withdraw, withdrawAsync, status };
};

export default useWithdraw;
