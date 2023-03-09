import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DATA, FARM_ZAP_OUT } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import { queryClient } from "src/config/reactQuery";
import useFarmDetails from "./useFarmDetails";
import useBalances from "../useBalances";

const useZapOut = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances } = useBalances();

    const _zapOut = async ({ withdrawAmt, max }: { withdrawAmt: number; max?: boolean }) => {
        await farmFunctions[farm.id].zapOut({ zapAmount: withdrawAmt, currentWallet, signer, chainId, max });
        reloadBalances();
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
