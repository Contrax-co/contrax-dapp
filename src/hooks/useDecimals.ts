import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchDecimals } from "src/state/decimals/decimalsReducer";
import useFarms from "./farms/useFarms";
import useWallet from "./useWallet";

export const useDecimals = () => {
    const { farms } = useFarms();
    const { isLoading, decimals, isFetched } = useAppSelector((state) => state.decimals);
    const { arbitrumPublicClient } = useWallet();
    const dispatch = useAppDispatch();

    const reloadDecimals = useCallback(() => {
        dispatch(fetchDecimals({ farms, publicClient: arbitrumPublicClient }));
    }, [farms, dispatch, arbitrumPublicClient]);

    return { isLoading: isLoading && !isFetched, isFetched, isFetching: isLoading, decimals, reloadDecimals };
};
