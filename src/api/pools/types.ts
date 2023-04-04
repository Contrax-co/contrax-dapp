import { BigNumber, Signer } from "ethers";
import { Balances } from "src/state/balances/types";
import { Decimals } from "src/state/decimals/types";
import { Prices } from "src/state/prices/types";

export interface ZapInArgs {
    amountInWei: string | BigNumber;
    signer?: Signer;
    chainId: number;
    max?: boolean;
    token: string;
    balances: Balances;
    currentWallet: string;
}

export interface ZapOutArgs {
    amountInWei: string | BigNumber;
    currentWallet: string;
    signer?: Signer;
    chainId: number;
    max?: boolean;
    token: string;
}

export interface DepositArgs {
    depositAmount: number;
    currentWallet: string;
    signer?: Signer;
    chainId: number;
    max?: boolean;
}

export interface WithdrawArgs {
    withdrawAmount: number;
    currentWallet: string;
    signer?: Signer;
    chainId: number;
    max?: boolean;
}

export interface TokenAmounts {
    amount: string;
    amountDollar: string;
    tokenAddress: string;
    tokenSymbol: string;
}

export interface FarmDataProcessed {
    Depositable_Amounts: TokenAmounts[];
    Withdrawable_Amounts: TokenAmounts[];
    ID: number;
}

export type DepositFn = (args: DepositArgs) => Promise<void>;
export type WithdrawFn = (args: WithdrawArgs) => Promise<void>;
export type ZapInFn = (args: ZapInArgs) => Promise<void>;
export type ZapOutFn = (args: ZapOutArgs) => Promise<void>;
export type GetFarmDataProcessedFn = (balances: Balances, prices: Prices, decimals: Decimals) => FarmDataProcessed;
export interface FarmFunctions {
    getProcessedFarmData: GetFarmDataProcessedFn;
    deposit: DepositFn;
    withdraw: WithdrawFn;
    zapIn: ZapInFn;
    zapOut: ZapOutFn;
}
export type DynamicFarmFunctions = (farmId: number) => FarmFunctions;
