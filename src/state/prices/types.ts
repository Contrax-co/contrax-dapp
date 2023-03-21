import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    prices: Prices;
    oldPrices: Partial<OldPrices>;
    isLoading: boolean;
    isFetched: boolean;
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

export interface Prices {
    [key: string]: number;
}
