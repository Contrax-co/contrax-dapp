import { useQuery, useQueryClient } from "@tanstack/react-query";
import farmFunctions from "src/api/pools";
import { FARM_DATA } from "src/config/constants/query";
import { multicallProvider } from "src/context/WalletProvider";
import { Farm, FarmData } from "src/types";
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

    const ethBalanceUpdate = async () => {
        const updatedBalancePromise = multicallProvider.getBalance(currentWallet);
        const updatedBalance = await updatedBalancePromise;
        queryClient.setQueriesData<FarmData>(["farm", "data"], (old) => {
            if (old) {
                return farmFunctions[old!.ID].getModifiedFarmDataByEthBalance(old!, updatedBalance);
            }
        });
    };

    return {
        farmData,
        isLoading: isInitialLoading && !farmData,
        refetch,
        refetchAllFarms,
        isRefetching,
        ethBalanceUpdate,
    };
};

export default useFarmDetails;
