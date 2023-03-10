import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchDecimals } from "src/state/decimals/decimalsReducer";
import useFarms from "./farms/useFarms";
import useWallet from "./useWallet";

export const useDecimals = () => {
    const { farms } = useFarms();
    const { isLoading, decimals, isFetched } = useAppSelector((state) => state.decimals);
    const { multicallProvider } = useWallet();
    const dispatch = useAppDispatch();

    const reloadDecimals = useCallback(() => {
        dispatch(fetchDecimals({ farms, multicallProvider }));
    }, [farms, dispatch, multicallProvider]);

    return { isLoading: isLoading && !isFetched, isFetched, isFetching: isLoading, decimals, reloadDecimals };
};
