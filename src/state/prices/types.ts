import { Farm } from "src/types";

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
}
