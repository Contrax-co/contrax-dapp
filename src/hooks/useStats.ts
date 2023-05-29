import React, { useEffect, useState } from "react";
import { getUserTVLs, Response } from "src/api/usersTVLs";
import usePriceOfTokens from "./usePriceOfTokens";
import { useDecimals } from "./useDecimals";
import { toEth } from "src/utils/common";
import { getAddress } from "ethers/lib/utils.js";
import useFarms from "./farms/useFarms";
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

    const fetchUserTVLs = async (page: number) => {
        return axios.get(`${BACKEND_BASE_URL}stats/tvl?page=${page}&limit=10`);
    };

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
