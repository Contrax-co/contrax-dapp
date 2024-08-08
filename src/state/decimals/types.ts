import { PoolDef } from "src/config/constants/pools_json";
import { IClients } from "src/types";
import { Address } from "viem";

export interface StateInterface {
    decimals: Decimals;
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateDecimalsActionPayload {
    farms: PoolDef[];
    getPublicClient: (chainId: number) => IClients["public"];
}

export interface Decimals {
    [chainId: number]: Record<Address, number>;
}
