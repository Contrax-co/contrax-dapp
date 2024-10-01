import { PoolDef } from "src/config/constants/pools_json";
import { Address } from "viem";

export interface StateInterface {
    prices: Prices;
    oldPrices: OldPrices;
    isLoading: boolean;
    isFetched: boolean;
    isLoadedOldPrices: boolean;
    isFetchingOldPrices: boolean;
}

export interface OldPrices {
    [chainId: string]: {
        [address: string]: {
            timestamp: number;
            price: number;
        }[];
    };
}

export interface AddPrice {
    [key: string]: number;
}
export interface GetOldPricesActionPayload {
    lpData: {
        tokenId: string;
        blockTimestamp: string;
    }[];
    farms: PoolDef[];
}

export interface Prices {
    [chainId: number]: Record<Address, number>;
}
