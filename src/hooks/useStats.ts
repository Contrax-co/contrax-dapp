import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";

type userTVL = {
    id: string;
    tvl: number;
    vaultTvls: any[];
};

export const useStats = () => {
    const [page, setPage] = useState(1);

    const fetchUserTVLs = useCallback(async (page: number) => {
        return axios.get(`${BACKEND_BASE_URL}stats/tvl?page=${page}&limit=10`);
    }, []);

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/tvl", page],
        queryFn: () => fetchUserTVLs(page),
        keepPreviousData: true,
    });

    return {
        userTVLs: data?.data.data as userTVL[],
        page,
        setPage,
        isLoading: isLoading || isFetching,
        error,
    };
};
