import { useMemo } from "react";
import { useQueries, QueryFunction } from "@tanstack/react-query";
import { TOKEN_PRICE } from "src/config/constants/query";
import useConstants from "./useConstants";
import { getPrice } from "src/api/token";

const usePriceOfTokens = (addresses: string[]) => {
    const { NETWORK_NAME, CHAIN_ID } = useConstants();

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
            placeholderData: 0,
        })),
    });

    const resultingPrices = useMemo(() => {
        const obj: { [key: string]: number } = {};
        addresses.forEach((address, index) => {
            obj[address] = results[index].data || 0;
        });
        return obj;
    }, [addresses, results]);

    const prices = useMemo(() => resultingPrices, [JSON.stringify(resultingPrices)]);

    const isLoading = useMemo(() => results.some((result) => result.isLoading || result.isPlaceholderData), [results]);

    const isFetching = useMemo(() => results.some((result) => result.isFetching), [results]);

    return { prices, isLoading, isFetching };
};

export default usePriceOfTokens;
