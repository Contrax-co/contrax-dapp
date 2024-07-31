import { Farm } from "src/types";

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
}

export interface Prices {
    [key: string]: number;
}
