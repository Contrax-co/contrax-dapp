import { useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import { Farm } from "src/types";
import useWallet from "../useWallet";
import useFarms from "./useFarms";
import { fetchApys } from "src/state/apys/apysReducer";

/**
 * Gets Apy of Farm
 * @param farm[]
 * @returns apy
 */
export const useFarmApys = () => {
    const { farms } = useFarms();
    const { isLoading, apys, isFetched } = useAppSelector((state) => state.apys);
    const { networkId, multicallProvider } = useWallet();
    const dispatch = useAppDispatch();

    const reloadApys = useCallback(() => {
        console.log("reloadApys");
        dispatch(fetchApys({ farms, chainId: networkId, multicallProvider }));
    }, [farms, networkId, dispatch, multicallProvider]);

    return { isLoading: isLoading && !isFetched, isFetched, isFetching: isLoading, apys, reloadApys };
};

const useFarmApy = (farm: Farm) => {
    const { isLoading, apys, isFetched } = useAppSelector((state) => state.apys);

    const apy = useMemo(() => apys[farm.id], [apys, farm.id]);

    return { apy, isLoading: isLoading && !isFetched, isFetched, isFetching: isLoading };
};

export default useFarmApy;
