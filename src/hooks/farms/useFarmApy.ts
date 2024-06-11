import { useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import { Farm } from "src/types";
import { fetchApys } from "src/state/apys/apysReducer";

/**
 * Gets Apy of Farm
 * @param farm[]
 * @returns apy
 */
export const useFarmApys = () => {
    const { isLoading, apys, isFetched } = useAppSelector((state) => state.apys);
    const dispatch = useAppDispatch();

    const reloadApys = useCallback(() => {
        dispatch(fetchApys());
    }, []);

    return { isLoading: isLoading && !isFetched, isFetched, isFetching: isLoading, apys, reloadApys };
};

const useFarmApy = (farm: Farm) => {
    const { isLoading, apys, isFetched } = useAppSelector((state) => state.apys);

    const apy = useMemo(() => apys[farm.id], [apys, farm.id]);

    return { apy, isLoading: isLoading && !isFetched, isFetched, isFetching: isLoading };
};

export default useFarmApy;
