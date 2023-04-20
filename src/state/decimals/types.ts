import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    decimals: Partial<Decimals>;
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateDecimalsActionPayload {
    farms: Farm[];
    multicallProvider: MulticallProvider;
}

export interface Decimals {
    [key: string]: number;
}
