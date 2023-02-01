import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { APY_TOKEN, APY_VISION_URL } from "src/config/constants";
import { FARM_APY } from "src/config/constants/query";
import useConstants from "../useConstants";
import useWallet from "../useWallet";

/**
 * Gets Apy from apy vision
 * @param address
 * @returns apy
 */
const useFarmApy = (address: string) => {
    const { NETWORK_NAME, CHAIN_ID } = useConstants();

    const getApy = async () => {
        const res = await axios.get(
            APY_VISION_URL + `/contractInsights/farmSearch/${CHAIN_ID}/${address}?accessToken=${APY_TOKEN}`
        );
        // console.log("useFarmApy", address, res);
        return Number(res.data.results[0]["apy30d"]) || 0;
    };

    const {
        data: apy,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(FARM_APY(address, NETWORK_NAME), getApy, {
        enabled: !!NETWORK_NAME && !!address && !!CHAIN_ID,
        initialData: 0,
    });

    return { apy, refetch, isLoading, isFetching };
};

export default useFarmApy;
