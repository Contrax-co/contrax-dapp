import { Farm, FarmData } from "src/types";
import { Balances } from "../balances/types";
import { Decimals } from "../decimals/types";
import { Prices } from "../prices/types";
import { TotalSupplies } from "../supply/types";
import { FarmTransactionType } from "src/types/enums";
import { PublicClient } from "viem";

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
    farms: Farm[];
    totalSupplies: Partial<TotalSupplies>;
    currentWallet: string;
    balances: Balances;
    prices: Prices;
    decimals: Partial<Decimals>;
}

export interface Earnings {
    [farmId: number]: number;
}

export interface FetchEarningsAction {
    farms: Farm[];
    currentWallet: string;
    decimals: Partial<Decimals>;
    prices: Partial<Prices>;
    balances: Balances;
    publicClient: PublicClient;
    totalSupplies: Partial<TotalSupplies>;
    chainId: number;
}
