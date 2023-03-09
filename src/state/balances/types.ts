import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    balances: {
        [key: string]: Balance;
    };
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
