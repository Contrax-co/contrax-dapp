import { useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { getApy } from "src/api/apy";
import { APY_TOKEN, APY_VISION_URL } from "src/config/constants";
import { FARM_APY } from "src/config/constants/query";
import { Farm, Apys } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import useFarms from "./useFarms";

/**
 * Gets Apy of Farm
 * @param farm
 * @returns apy
 */
const useFarmApy = (farm: Pick<Farm, "lp_address" | "originPlatform">) => {
    const { NETWORK_NAME, CHAIN_ID } = useConstants();
    const { provider } = useWallet();

    const {
        data: apy,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(FARM_APY(farm.lp_address, NETWORK_NAME), () => getApy(farm, CHAIN_ID, provider), {
        enabled: !!NETWORK_NAME && !!farm.lp_address && !!CHAIN_ID,
        initialData: {
            feeApr: 0,
            rewardsApr: 0,
            apy: 0,
            compounding: 0,
        },
    });

    return { ...apy, refetch, isLoading, isFetching };
};

/**
 * Gets Apy of Farm
 * @param farm[]
 * @returns apy
 */
export const useFarmApys = () => {
    const { farms } = useFarms();
    const { NETWORK_NAME, CHAIN_ID } = useConstants();
    const { provider, currentWallet } = useWallet();

    const results = useQueries({
        queries: farms.map((farm) => ({
            // Query key index should be changed in getPrice function as well if changed here
            queryKey: FARM_APY(farm.lp_address, NETWORK_NAME),
            queryFn: () => getApy(farm, CHAIN_ID, provider, currentWallet),
            initialData: {
                feeApr: 0,
                rewardsApr: 0,
                apy: 0,
                compounding: 0,
            },
            enabled: !!NETWORK_NAME && !!farm.lp_address && !!CHAIN_ID,
        })),
    });

    const resulting = useMemo(() => {
        const obj: { [key: string]: Apys } = {};
        farms.forEach((farm, index) => {
            obj[farm.lp_address] = results[index].data!;
        });
        return obj;
    }, [farms, results]);
    const apys = useMemo(() => resulting, [JSON.stringify(resulting)]);

    const isFetching = useMemo(() => results.some((result) => result.isFetching), [results]);

    return { apys, isFetching };
};

export default useFarmApy;
