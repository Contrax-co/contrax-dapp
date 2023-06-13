import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TableColumns } from "src/types/enums";
import { fetchCountActiveUsers, fetchUserTVLs } from "src/api/stats";

export const useStats = () => {
    const [page, setPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<TableColumns>();
    const [order, setOrder] = useState<"" | "-">("");
    const [search, setSearch] = useState("");

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/tvl", page, sortBy, order, search],
        queryFn: () => fetchUserTVLs(page, sortBy, order, search),
        keepPreviousData: true,
    });

    const { data: activeUsers } = useQuery({
        queryKey: ["stats/count/active-users", page, sortBy, order, search],
        queryFn: () => fetchCountActiveUsers(),
    });

    return {
        ...data?.data,
        userTVLs: data?.data.data,
        setPage,
        sortBy,
        setSortBy,
        activeUsers,
        order,
        setOrder,
        search,
        setSearch,
        isLoading: isLoading || isFetching,
        error: error as string,
    };
};
