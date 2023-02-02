import { useMemo } from "react";
import { useQueries, useQuery, QueryFunction } from "@tanstack/react-query";
import axios from "axios";
import { TOKEN_PRICE } from "src/config/constants/query";
import useConstants from "./useConstants";
import useWallet from "./useWallet";
import { getPrice } from "src/api/token";

// const usePriceOfToken = (address: string) => {
//     const { NETWORK_NAME, COINS_LLAMA_PRICE, CHAIN_ID } = useConstants();

//     const fetchPrice: QueryFunction<number> = async ({ queryKey }) => {
//         const tokenAddress = queryKey[3] as string;
//         const price = await getPrice(tokenAddress, CHAIN_ID);

//         return price;
//     };
//     const {} = useQuery(TOKEN_PRICE(address || "", NETWORK_NAME), fetchPrice, {
//         enabled: !!address,
//         initialData: 0,
//     });

//     return res;
// };

const usePriceOfTokens = (addresses: string[]) => {
    const { NETWORK_NAME, COINS_LLAMA_PRICE, CHAIN_ID } = useConstants();

    const fetchPrice: QueryFunction<number> = async ({ queryKey }) => {
        const tokenAddress = queryKey[3] as string;
        const price = await getPrice(tokenAddress, CHAIN_ID);

        return price;
    };

    const results = useQueries({
        queries: addresses.map((address) => ({
            // Query key index should be changed in getPrice function as well if changed here
            queryKey: TOKEN_PRICE(address || "", NETWORK_NAME),
            queryFn: fetchPrice,
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
