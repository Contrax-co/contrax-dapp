import { useQuery } from "@tanstack/react-query";
import useWallet from "src/hooks/useWallet";
import { fetchReferrals } from "src/api/referrals";

export const useMyReferrals = () => {
    const { currentWallet } = useWallet();

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["accounts/reffered-accounts", currentWallet],
        queryFn: () => fetchReferrals(currentWallet),
        keepPreviousData: true,
    });

    return { referrals: data?.data.data.accounts, isLoading: isLoading || isFetching, error, currentWallet };
};
