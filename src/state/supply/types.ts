import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    totalSupplies: Partial<TotalSupplies>;
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateBalancesActionPayload {
    farms: Farm[];
    multicallProvider: MulticallProvider;
}

export interface TotalSupplies {
    [key: string]: string;
}
