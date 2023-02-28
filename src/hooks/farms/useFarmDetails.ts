import { useQuery } from "@tanstack/react-query";
import farmFunctions from "src/api/pools";
import { FARM_DATA } from "src/config/constants/query";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";

const useFarmDetails = (farm?: Farm | number) => {
    const { currentWallet, provider, balanceBigNumber, balance } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const {
        data: farmData,
        refetch,
        isLoading,
    } = useQuery(
        // @ts-ignore
        FARM_DATA(currentWallet, NETWORK_NAME, farm.id ? farm.id : farm, balance),
        // @ts-ignore
        () => farmFunctions[farm.id ? farm.id : farm]?.getFarmData(provider, currentWallet, balanceBigNumber),
        {
            enabled: !!currentWallet && !!provider && !!farm,
        }
    );
    return { farmData, isLoading, refetch };
};

export default useFarmDetails;
