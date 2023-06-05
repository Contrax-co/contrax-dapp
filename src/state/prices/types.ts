import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { Decimals } from "../decimals/types";

export interface StateInterface {
    prices: Prices;
    oldPrices: Partial<OldPrices>;
    isLoading: boolean;
    isFetched: boolean;
    isLoadedOldPrices: boolean;
    isFetchingOldPrices: boolean;
}

export interface OldPrices {
    [key: string]: {
        timestamp: number;
        price: number;
    }[];
}

export interface AddPrice {
    [key: string]: number;
}
export interface UpdatePricesActionPayload {
    chainId: number;
    farms: Farm[];
    multicallProvider: MulticallProvider;
}

export interface GetOldPricesActionPayload {
    lpData: {
        token0: string;
        token1: string;
        totalSupply: string;
        reserve0: string;
        reserve1: string;
        tokenId: string;
        blockTimestamp: string;
    }[];
    farms: Farm[];
    provider: MulticallProvider;
    chainId: number;
    decimals: Decimals;
}

export interface Prices {
    [key: string]: number;
}
