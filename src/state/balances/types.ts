import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export interface StateInterface {
    balances: Balances;
    polygonBalances: Balances;
    mainnetBalances: Balances;
    isLoading: boolean;
    isFetched: boolean;
    account: string;
}

export interface UpdateBalancesActionPayload {
    account: string;
    farms: Farm[];
    multicallProvider: MulticallProvider;
}
export interface UpdatePolygonBalancesActionPayload {
    account: string;
    addresses: string[];
    multicallProvider: MulticallProvider;
}

export interface Balances {
    [key: string]: string | undefined;
}
