import { Farm, FarmData } from "src/types";
import { Balances } from "../balances/types";
import { Decimals } from "../decimals/types";
import { Prices } from "../prices/types";

export interface StateInterface {
    farmDetails: FarmDetails;
    earnings: Earnings;
    isLoading: boolean;
    isFetched: boolean;
    account: string;
}

export interface FarmDetails {
    [farmid: number]: FarmData | undefined;
}

export interface FetchFarmDetailsAction {
    farms: Farm[];
    currentWallet: string;
    balances: Balances;
    prices: Prices;
}

export interface Earnings {
    [farmId: number]: number;
}

export interface FetchEarningsAction {
    farms: Farm[];
    currentWallet: string;
    decimals: Partial<Decimals>;
    prices: Partial<Prices>;
}
