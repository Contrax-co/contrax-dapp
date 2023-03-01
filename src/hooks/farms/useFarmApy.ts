import { QueriesObserver, QueryObserver, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import { getApy } from "src/api/apy";
import { FARM_APY } from "src/config/constants/query";
import { Apys, Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import useFarms from "./useFarms";

/**
 * Gets Apy of Farm
 * @param farm[]
 * @returns apy
 */
export const useFarmApys = (farmIdOrLpAddress?: number | string) => {
    const { farms } = useFarms();
    const { NETWORK_NAME, CHAIN_ID } = useConstants();
    const queryClient = useQueryClient();
    const [results, setResults] = useState<any>([]);

    useEffect(() => {
        const observer = new QueriesObserver(
            queryClient,
            farms.map((farm) => ({
                queryKey: FARM_APY(farm.lp_address, NETWORK_NAME),
            }))
        );
        const unsubscribe = observer.subscribe((results) => {
            setResults(results);
        });
        return () => unsubscribe();
    }, [NETWORK_NAME]);

    const resulting = useMemo(() => {
        const obj: { [key: string]: Apys } = {};
        farms.forEach((farm, index) => {
            try {
                // if we get error while fetching any apy, assign 0 values
                if (results[index].status === "success") {
                    obj[farm.lp_address] = results[index].data as Apys;
                    obj[farm.id] = results[index].data as Apys;
                } else {
                    obj[farm.lp_address] = {
                        apy: 0,
                        compounding: 0,
                        feeApr: 0,
                        rewardsApr: 0,
                    };
                    obj[farm.id] = {
                        apy: 0,
                        compounding: 0,
                        feeApr: 0,
                        rewardsApr: 0,
                    };
                }
            } catch (error) {
                obj[farm.lp_address] = {
                    apy: 0,
                    compounding: 0,
                    feeApr: 0,
                    rewardsApr: 0,
                };
                obj[farm.id] = {
                    apy: 0,
                    compounding: 0,
                    feeApr: 0,
                    rewardsApr: 0,
                };
            }
        });
        return obj;
    }, [farms, results]);

    const allFarmApys = useMemo(() => resulting, [JSON.stringify(resulting)]);

    const isLoading = useMemo(
        () => results.some((result: any) => result.isLoading || result.isPlaceholderData),
        [results]
    );

    const isFetching = useMemo(() => results.some((result: any) => result.isFetching), [results]);

    const farmApys = useMemo((): Apys => {
        let _apys = {
            apy: farmIdOrLpAddress ? allFarmApys?.[farmIdOrLpAddress]?.apy ?? 0 : 0,
            compounding: farmIdOrLpAddress ? allFarmApys?.[farmIdOrLpAddress]?.compounding ?? 0 : 0,
            feeApr: farmIdOrLpAddress ? allFarmApys?.[farmIdOrLpAddress]?.feeApr ?? 0 : 0,
            rewardsApr: farmIdOrLpAddress ? allFarmApys?.[farmIdOrLpAddress]?.rewardsApr ?? 0 : 0,
        };
        return _apys;
    }, [farmIdOrLpAddress, allFarmApys]);

    return { farmApys, allFarmApys, isLoading, isFetching };
};

const useFarmApy = (farm: Farm) => {
    const { NETWORK_NAME, CHAIN_ID } = useConstants();
    const { provider, currentWallet } = useWallet();

    const fetchApy = () => {
        return getApy(farm, CHAIN_ID, provider, currentWallet);
    };

    const { data, isInitialLoading, refetch, isFetching } = useQuery(
        FARM_APY(farm.lp_address, NETWORK_NAME),
        fetchApy,
        {
            enabled: !!NETWORK_NAME && !!farm.lp_address && !!CHAIN_ID && !!provider,
            staleTime: 1000 * 60 * 5,
        }
    );

    return { apys: data, isLoading: isInitialLoading, refetch, isFetching };
};

export default useFarmApy;
