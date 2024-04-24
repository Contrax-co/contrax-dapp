import { Farm } from "src/types";
import { PublicClient } from "viem";

export interface StateInterface {
    decimals: Partial<Decimals>;
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateDecimalsActionPayload {
    farms: Farm[];
    publicClient: PublicClient;
}

export interface Decimals {
    [key: string]: number;
}
