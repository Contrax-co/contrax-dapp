import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TOKEN_PRICE } from "src/config/constants/query";
import useConstants from "./useConstants";
import useWallet from "./useWallet";

const usePriceOfToken = (address: string) => {
    const { currentWallet } = useWallet();
    const { NETWORK_NAME, COINS_LLAMA_PRICE } = useConstants();

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
    } = useQuery(TOKEN_PRICE(currentWallet, address, NETWORK_NAME), getPrice, {
        enabled: !!address && !!currentWallet && !!COINS_LLAMA_PRICE && !!NETWORK_NAME,
        initialData: 0,
    });

    return { price, refetch, isLoading, isFetching };
};

export default usePriceOfToken;
