import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchSpecificFarmApy } from "src/api/stats";
import { VAULT_APY_GRAPH } from "src/config/constants/query";

export const useApy = (id: number) => {
    const { data, isLoading } = useQuery({
        queryKey: VAULT_APY_GRAPH(id),
        queryFn: () => fetchSpecificFarmApy(id),
        staleTime: 1000 * 60 * 5, // 5min stale time
    });

    const averageApy = useMemo(() => {
        if (!data || data.length === 0) return 0;
        const sumApy = data.reduce((a, b) => a + b.apy, 0);
        return sumApy / data.length;
    }, [data]);

    return {
        apy: data,
        loading: isLoading,
        averageApy,
    };
};
