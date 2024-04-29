import { useQuery } from "@tanstack/react-query";
import useWallet from "src/hooks/useWallet";
import { fetchReferrals } from "src/api/referrals";
import { REFFERED_ACCOUNTS } from "src/config/constants/query";

export const useMyReferrals = () => {
    const { currentWallet } = useWallet();

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: REFFERED_ACCOUNTS(currentWallet!),
        queryFn: () => fetchReferrals(currentWallet!),
        enabled: !!currentWallet,
    });

    return { referrals: data?.data.data.accounts, isLoading: isLoading || isFetching, error, currentWallet };
};
