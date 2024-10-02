import { PoolDef } from "src/config/constants/pools_json";
import { IClients } from "src/types";
import { Address, PublicClient } from "viem";

export interface StateInterface {
    balances: Balances;
    isLoading: boolean;
    isFetched: boolean;
    account?: Address;
}

export interface UpdateBalancesActionPayload {
    account: Address;
    farms: PoolDef[];
    getPublicClient: (chainId: number) => IClients["public"];
}
export interface UpdatePolygonBalancesActionPayload {
    account: Address;
    addresses: Address[];
    publicClient: PublicClient;
}

export interface Balances {
    [chainId: number]: Record<Address, string>;
}
