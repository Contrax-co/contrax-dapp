import { useQuery } from "@tanstack/react-query";
import { fetchUserTVL } from "src/api/userTVL";
import useWallet from "./useWallet";

const useUserTVL = () => {
    const { currentWallet } = useWallet();

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/tvl/address", currentWallet],
        queryFn: () => fetchUserTVL(currentWallet),
        keepPreviousData: true,
    });

    return {
        ...data?.data.data,
        isLoading: isLoading || isFetching,
        error,
    };
};

export default useUserTVL;
