import { useMemo, useEffect, useState, useCallback } from "react";
import { QueriesObserver, QueryObserver, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApy } from "src/api/apy";
import { FARM_APY } from "src/config/constants/query";
import { useAppDispatch, useAppSelector } from "src/state";
import { Apys } from "src/state/apys/types";
import { Farm } from "src/types";
import useConstants from "../useConstants";
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
        console.log("reloadApys")
        dispatch(fetchApys({ farms, chainId: networkId, multicallProvider }));
    }, [farms, networkId, dispatch, multicallProvider]);

    return { isFetched, apys, isLoading, reloadApys };
};

const useFarmApy = (farm: Farm) => {
    const { isLoading, apys, isFetched } = useAppSelector((state) => state.apys);

    const apy = useMemo(() => apys[farm.id], [apys, farm.id]);

    return { apy, isLoading, isFetched };
};

export default useFarmApy;
