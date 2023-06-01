import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";
import { TableColumns } from "src/types/enums";
import { Order, UserTVL } from "src/types";

interface ResponseData {
    data: UserTVL[];
    hasPrevPage: number;
    hasNextPage: number;
    totalPages: number;
    totalDocs: number;
    limit: number;
}

export const useStats = () => {
    const [page, setPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<TableColumns>();
    const [order, setOrder] = useState<"" | "-">("");

    const fetchUserTVLs = useCallback(async (page: number, sortBy: TableColumns | undefined, order: Order) => {
        return axios.get<ResponseData>(
            `${BACKEND_BASE_URL}stats/tvl?page=${page}&limit=10&sort=${order + sortBy?.toLowerCase()}`
        );
    }, []);

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/tvl", page, sortBy, order],
        queryFn: () => fetchUserTVLs(page, sortBy, order),
        keepPreviousData: true,
    });

    useEffect(() => {
        console.log(data);

        return () => {};
    }, [data]);

    return {
        userTVLs: data?.data.data,
        hasPrevPage: data?.data.hasPrevPage,
        hasNextPage: data?.data.hasNextPage,
        totalPages: data?.data.totalPages,
        totalDocs: data?.data.totalDocs,
        limit: data?.data.limit,
        page,
        setPage,
        sortBy,
        setSortBy,
        order,
        setOrder,
        isLoading: isLoading || isFetching,
        error: error as string,
    };
};
