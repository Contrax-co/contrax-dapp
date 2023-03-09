import { Farm, FarmData } from "src/types";

export interface StateInterface {
    farmDetails: FarmDetails;
    isLoading: boolean;
    isFetched: boolean;
}

export interface FarmDetails {
    [farmid: number]: FarmData;
}

export interface FetchFarmDetailsAction {
    farms: Farm[];
    currentWallet: string;
}
