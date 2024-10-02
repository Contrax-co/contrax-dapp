import { useQuery } from "@tanstack/react-query";
import { fetchReferralDashboard } from "src/api/stats";

export const useReferralDashboard = () => {
    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/referral-dashboard"],
        queryFn: () => fetchReferralDashboard(),
    });

    return {
        data,
        isLoading: isLoading || isFetching,
        error: error as unknown as string,
    };
};
