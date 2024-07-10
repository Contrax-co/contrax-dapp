import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchSpecificLpPrice } from "src/api/stats";
import { VAULT_LP_PRICE_GRAPH } from "src/config/constants/query";

export const useLp = (id: number) => {
    const { data, isLoading } = useQuery({
        queryKey: VAULT_LP_PRICE_GRAPH(id),
        queryFn: () => fetchSpecificLpPrice(id),
        staleTime: 1000 * 60, // 1min stale time
    });

    const averageLp = useMemo(() => {
        if (!data || data.length === 0) return 0;
        const sumlp = data.reduce((a, b) => a + b.lp, 0);
        return sumlp / data.length;
    }, [data]);

    return {
        lp: data,
        isLpPriceLoading: isLoading,
        averageLp,
    };
};
