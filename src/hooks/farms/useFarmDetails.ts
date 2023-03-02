import { useQuery, useQueryClient } from "@tanstack/react-query";
import farmFunctions from "src/api/pools";
import { FARM_DATA } from "src/config/constants/query";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";

const useFarmDetails = (farm?: Farm) => {
    const { currentWallet, provider, balanceBigNumber, balance } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const queryClient = useQueryClient();

    const refetchAllFarms = async () => {
        await queryClient.refetchQueries({
            queryKey: ["farm", "data"],
            type: "active",
        });
    };

    const {
        data: farmData,
        refetch,
        isInitialLoading,
        isRefetching,
        ...query
    } = useQuery(
        FARM_DATA(currentWallet, NETWORK_NAME, farm?.id!),
        () =>
            currentWallet && farm && provider
                ? // @ts-ignore
                  farmFunctions[farm.id ? farm.id : farm]?.getFarmData(provider, currentWallet, balanceBigNumber)
                : null,
        {
            enabled: !!currentWallet && !!provider && !!farm,
        }
    );

    return { farmData, isLoading: isInitialLoading && !farmData, refetch, refetchAllFarms, isRefetching };
};

export default useFarmDetails;
