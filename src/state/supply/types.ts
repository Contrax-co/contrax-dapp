import { Farm, IClients } from "src/types";

export interface StateInterface {
    totalSupplies: Partial<TotalSupplies>;
    isLoading: boolean;
    isFetched: boolean;
}

export interface UpdateBalancesActionPayload {
    farms: Farm[];
    client: Omit<IClients, "wallet">;
}

export interface TotalSupplies {
    [key: string]: string;
}
