import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UsersTableColumns } from "src/types/enums";
import { fetchBoostedApy, fetchCountActiveUsers, fetchUserTVLs, fetchVaultStats } from "src/api/stats";
import useFarms from "./farms/useFarms";

export const useStats = () => {
    const [page, setPage] = useState<number>(1);
    // @ts-ignore
    const [sortBy, setSortBy] = useState<UsersTableColumns>("");
    const [order, setOrder] = useState<"" | "-">("");
    const [search, setSearch] = useState("");
    const { farms } = useFarms();

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/tvl", page, sortBy, order, search],
        queryFn: () => fetchUserTVLs(page, sortBy, order, search),
    });

    const { data: activeUsers } = useQuery({
        queryKey: ["stats/count/active-users"],
        queryFn: () => fetchCountActiveUsers(),
    });

    const { data: vaultStatsTemp } = useQuery({
        queryKey: ["stats/tvl/vaults"],
        queryFn: () => fetchVaultStats(),
    });

    const { data: aprBoost } = useQuery({
        queryKey: ["stats/arb"],
        queryFn: () => fetchBoostedApy(),
    });

    const vaultStats = useMemo(
        () =>
            vaultStatsTemp?.map((vault) => ({
                ...vault,
                name: farms.find((farm) => farm.vault_addr === vault.address)?.name,
            })),
        [vaultStatsTemp, farms]
    );

    return {
        ...data?.data,
        userTVLs: data?.data.data,
        vaultStats,
        setPage,
        sortBy,
        setSortBy,
        activeUsers,
        apyBoost: aprBoost?.aprBoost,
        order,
        setOrder,
        search,
        setSearch,
        isLoading: isLoading || isFetching,
        error: error as unknown as string,
    };
};
