import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    balances: Balances;
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateBalancesActionPayload {
    account: string;
    farms: Farm[];
    multicallProvider: MulticallProvider;
}

export interface Balance {
    decimals: number;
    balance: string;
}

export interface Balances {
    [key: string]: Balance;
}
