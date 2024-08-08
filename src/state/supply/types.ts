import { PoolDef } from "src/config/constants/pools_json";
import { IClients } from "src/types";
import { Address } from "viem";

export interface StateInterface {
    totalSupplies: TotalSupplies;
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateBalancesActionPayload {
    farms: PoolDef[];
    getPublicClient: (chainId: number) => IClients["public"];
}

export interface TotalSupplies {
    [chainId: number]: Record<Address, string>;
}
