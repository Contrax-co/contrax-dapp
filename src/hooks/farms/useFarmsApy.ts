import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { APY_TOKEN, APY_VISION_URL } from "src/config/constants";
import { FARMS_APY, FARM_APY } from "src/config/constants/query";
import useConstants from "../useConstants";
import useWallet from "../useWallet";

/**
 * Gets Apy from apy vision
 * @param address
 * @returns apy
 */
const useFarmsApy = (addresses: string[]) => {
    const { NETWORK_NAME, CHAIN_ID } = useConstants();

    const getApy = async () => {
        // const res = await axios.get(
        //     APY_VISION_URL + `/contractInsights/farmSearch/${CHAIN_ID}/${address}?accessToken=${APY_TOKEN}`
        // );
        // return Number(res.data.results[0]["apy30d"]) || 0;
        const requests = addresses.map((address) =>
            axios.get(APY_VISION_URL + `/contractInsights/farmSearch/${CHAIN_ID}/${address}?accessToken=${APY_TOKEN}`)
        );
        axios.all(requests).then((responses) => {
            responses.forEach((resp) => {
                let msg = {
                    server: resp.headers.server,
                    status: resp.status,
                    fields: Object.keys(resp.data).toString(),
                };
                // console.info(resp.config.url);
                // console.table(msg);
                // console.log("useFarmsApy", resp);
            });
        });
        return [0];
    };

    const {
        data: apy,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(FARMS_APY(addresses, NETWORK_NAME), getApy, {
        enabled: !!NETWORK_NAME && !!addresses && !!CHAIN_ID,
        initialData: [],
    });

    return { apy, refetch, isLoading, isFetching };
};

export default useFarmsApy;
