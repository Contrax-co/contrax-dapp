import { FarmData, IClients } from "src/types";
import { Balances } from "../balances/types";
import { Decimals } from "../decimals/types";
import { Prices } from "../prices/types";
import { TotalSupplies } from "../supply/types";
import { FarmTransactionType } from "src/types/enums";
import { PublicClient } from "viem";
import { PoolDef } from "src/config/constants/pools_json";

export interface StateInterface {
    farmDetails: FarmDetails;
    earnings: Earnings;
    isLoadingEarnings: boolean;
    isLoading: boolean;
    isFetched: boolean;
    account: string;
    farmDetailInputOptions: FarmDetailInputOptions;
}
export interface FarmDetailInputOptions {
    transactionType: FarmTransactionType;
    showInUsd: boolean;
    currencySymbol: string;
}

export interface FarmDetails {
    [farmid: number]: FarmData | undefined;
}

export interface FetchFarmDetailsAction {
    farms: PoolDef[];
    totalSupplies: TotalSupplies;
    currentWallet: string;
    balances: Balances;
    prices: Prices;
    decimals: Decimals;
}

export interface Earnings {
    [farmId: number]: number;
}

export interface FetchEarningsAction {
    farms: PoolDef[];
    currentWallet: string;
    decimals: Decimals;
    prices: Prices;
    balances: Balances;
    totalSupplies: TotalSupplies;
    getPublicClient: (chainId: number) => IClients["public"];
}
