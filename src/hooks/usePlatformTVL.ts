import { useQuery } from "@tanstack/react-query";
import { fetchPlatformTVL } from "src/api/platformTVL";

export const usePlatformTVL = () => {
    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/platform-tvl"],
        queryFn: () => fetchPlatformTVL(),
    });

    return { platformTVL: data?.data.data, isLoading: isLoading || isFetching, error };
};
