import { Farm } from "src/types";

export interface StateInterface {
    apys: { [farmId: number]: Apys };
    isLoading: boolean;
    isFetched: boolean;
}

export interface AddApysAction {
    [farmId: number]: Apys;
}

export interface Apys {
    feeApr: number;
    rewardsApr: number;
    apy: number;
    compounding: number;
    boost?: number;
}

export interface AddApyAction {
    data: Apys;
    farmId: number;
}

export interface FetchApysThunk {
    chainId: number;
    farms: Farm[];
}
