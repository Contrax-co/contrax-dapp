import { Farm } from "src/types";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { Address } from "viem";
import { PublicClient } from "wagmi";

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
