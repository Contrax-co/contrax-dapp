import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    balances: {
        [key: string]: string;
    };
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateBalancesActionPayload {
    account: string;
    farms: Farm[];
    multicallProvider: MulticallProvider;
}
