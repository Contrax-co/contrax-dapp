import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { COINS_LLAMA_PRICE, NETWORK_NAME } from "src/config/constants";
import { VAULT_TOKEN_PRICE } from "src/config/constants/query";
import useWallet from "../useWallet";

const usePriceOfToken = (address: string) => {
    const { currentWallet } = useWallet();

    const getPrice = async () => {
        const res = await axios.get(COINS_LLAMA_PRICE + address);
        const prices = JSON.stringify(res.data);
        const parse = JSON.parse(prices);

        const price = parse[`coins`][`${NETWORK_NAME}:${address}`][`price`];

        return price as number;
    };

    const {
        data: price,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(VAULT_TOKEN_PRICE(currentWallet, address, NETWORK_NAME), getPrice, {
        enabled: !!address && !!currentWallet,
        initialData: 0,
    });

    return { price, refetch, isLoading, isFetching };
};

export default usePriceOfToken;
