import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { APY_TOKEN, APY_VISION_STATS_URL } from "src/config/constants";
import { FEE_APY } from "src/config/constants/query";
import useConstants from "./useConstants";
import useWallet from "./useWallet";

const useFeeApy = (address?: string) => {
    const { NETWORK_NAME, CHAIN_ID } = useConstants();
    const { currentWallet } = useWallet();

    const getApy = async () => {
        const res = await axios.get(APY_VISION_STATS_URL + `/pools/${address}?accessToken=${APY_TOKEN}`);
        return Number(res.data[0]["fee_apys_inception"]) || 0;
    };

    const {
        data: apy,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(FEE_APY(currentWallet, address || "", NETWORK_NAME), getApy, {
        enabled: !!NETWORK_NAME && !!address && !!currentWallet && !!CHAIN_ID,
        initialData: 0,
    });

    return { apy, refetch, isLoading, isFetching };
};

export default useFeeApy;
