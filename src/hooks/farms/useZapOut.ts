import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import * as ethers from "ethers";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_OUT } from "src/config/constants/query";
import useNotify from "src/hooks/useNotify";
import useBalances from "../useBalances";
import useFarmsBalances from "./useFarmsBalances";
import useFarmsTotalSupply from "./useFarmsTotalSupply";
import { validateNumberDecimals } from "src/utils/common";
import { useApprovalErc20 } from "../useApproval";
import farmFunctions from "src/api/pools";
import { queryClient } from "src/config/reactQuery";

const useZapOut = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { refetch: refetchVaultBalance } = useBalances([{ address: farm.vault_addr, decimals: farm.decimals }]);

    const { refetch: refetchVaultBalances } = useFarmsBalances();

    const { refetch: refetchVaultSupplies } = useFarmsTotalSupply();

    const _zapOut = async ({ withdrawAmt, max }: { withdrawAmt: number; max?: boolean }) => {
        const cb = async () => {
            refetchVaultBalance();
            refetchVaultBalances();
            refetchVaultSupplies();
            // @ts-ignore
            await queryClient.refetchQueries(["farm", "data"], { active: true });
        };
        await farmFunctions[farm.id].zapOut({ zapAmount: withdrawAmt, currentWallet, signer, chainId, max, cb });
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
