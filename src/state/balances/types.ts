import { Farm } from "src/types";
import { PublicClient } from "viem";

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
    publicClient: PublicClient;
}
export interface UpdatePolygonBalancesActionPayload {
    account: string;
    addresses: string[];
    publicClient: PublicClient;
}

export interface Balances {
    [key: string]: string | undefined;
}
