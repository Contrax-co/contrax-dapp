import { Farm, FarmData } from "src/types";
import { Balances } from "../balances/types";
import { Prices } from "../prices/types";

export interface StateInterface {
    farmDetails: FarmDetails;
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
