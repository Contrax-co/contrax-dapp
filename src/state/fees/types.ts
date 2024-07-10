import { PoolFees } from "src/api/fees";

export interface StateInterface {
    poolFees: PoolFees[];
    isLoadingPoolFees: boolean;
}
