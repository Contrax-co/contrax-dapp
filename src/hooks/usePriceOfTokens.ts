import { useMemo } from "react";
import { useQueries, useQuery, QueryFunction } from "@tanstack/react-query";
import axios from "axios";
import { TOKEN_PRICE } from "src/config/constants/query";
import useConstants from "./useConstants";
import useWallet from "./useWallet";

const usePriceOfTokens = (addresses: string[]) => {
    const { NETWORK_NAME, COINS_LLAMA_PRICE } = useConstants();

    const getPrice: QueryFunction<number> = async ({ queryKey }) => {
        const tokenAddress = queryKey[3];
        const res = await axios.get(COINS_LLAMA_PRICE + tokenAddress);
        const prices = JSON.stringify(res.data);
        const parse = JSON.parse(prices);

        const price = parse[`coins`][`${NETWORK_NAME}:${tokenAddress}`][`price`];

        return price as number;
    };

    const results = useQueries({
        queries: addresses.map((address) => ({
            // Query key index should be changed in getPrice function as well if changed here
            queryKey: TOKEN_PRICE(address || "", NETWORK_NAME),
            queryFn: getPrice,
            initialData: 0,
        })),
    });

    const prices = useMemo(() => {
        const obj: { [key: string]: number } = {};
        addresses.forEach((address, index) => {
            obj[address] = results[index].data || 0;
        });
        return obj;
    }, [addresses, results]);

    const isFetching = useMemo(() => results.some((result) => result.isFetching), [results]);

    return { prices, isFetching };
};

export default usePriceOfTokens;