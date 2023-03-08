import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    prices: {
        [key: string]: number;
    };
    isLoading: boolean;
    isFetched: boolean;
}

export interface AddPrice {
    [key: string]: number;
}
export interface UpdatePricesActionPayload {
    chainId: number;
    farms: Farm[];
    multicallProvider: MulticallProvider;
}
