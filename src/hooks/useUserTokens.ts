import axios from "axios";
import { COVALENT_API_TOKEN, COVALENT_HQ_URL } from "src/config/constants";
import useWallet from "./useWallet";
import { useQuery } from "@tanstack/react-query";
import { CovalentToken } from "src/types";
import { USER_TOKENS } from "src/config/constants/query";
import useConstants from "./useConstants";

/**
 * Gets the user tokens from covalent
 * @returns Array of tokens
 */
const useUserTokens = () => {
    const { currentWallet, networkId } = useWallet();

    const getTokens = async () => {
        const res = await axios.get(
            `${COVALENT_HQ_URL}/${networkId}/address/${currentWallet}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=true`,
            {
                headers: {
                    Authorization: `Basic ${COVALENT_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const data = res.data.data.items as CovalentToken[];
        return data;
    };

    const {
        data: tokens,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(USER_TOKENS(currentWallet, networkId), getTokens, {
        enabled: !!networkId && !!currentWallet,
    });

    console.log("isoading", isLoading, isFetching, tokens);

    return {
        /**
         * Array of tokens
         */
        tokens,

        /**
         * Can be called to refetch the data from the api
         */
        refetch,

        /**
         * Will be true for first time Api is called
         */
        isLoading,

        /**
         * Will be true whenever api is called even in background
         */
        isFetching,
    };
};

export default useUserTokens;
