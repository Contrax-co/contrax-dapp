import { useCallback } from "react";
import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";
import { useQuery } from "@tanstack/react-query";

export const usePlatformTVL = () => {
    const fetchPlatformTVL = useCallback(async () => {
        return axios.get(`${BACKEND_BASE_URL}stats/platform-tvl`);
    }, []);

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/platform-tvl"],
        queryFn: () => fetchPlatformTVL(),
        keepPreviousData: true,
    });

    return { platformTVL: data?.data.data, isLoading: isLoading || isFetching, error };
};
