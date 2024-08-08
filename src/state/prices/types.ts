import { PoolDef } from "src/config/constants/pools_json";
import { Address } from "viem";

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
    farms: PoolDef[];
}

export interface Prices {
    [chainId: number]: Record<Address, number>;
}
