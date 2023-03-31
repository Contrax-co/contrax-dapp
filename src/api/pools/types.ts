import { Signer } from "ethers";
import { Balances } from "src/state/balances/types";
import { Prices } from "src/state/prices/types";

export interface ZapInArgs {
    zapAmount: number;
    signer?: Signer;
    chainId: number;
    max?: boolean;
    token: string;
    balances: Balances;
}

export interface ZapOutArgs {
    zapAmount: number;
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

export interface FarmDataProcessed {
    Max_Zap_Withdraw_Balance_Dollar: string;
    Max_Zap_Withdraw_Balance: string;
    Max_Token_Withdraw_Balance: string;
    Max_Token_Withdraw_Balance_Dollar: string;
    Max_Token_Deposit_Balance: string;
    Max_Token_Deposit_Balance_Dollar: string;
    Max_Zap_Deposit_Balance_Dollar: string;
    Max_Zap_Deposit_Balance: string;
    Token_Token_Symbol: string;
    Zap_Token_Symbol: string;
    Token_Deposit_Token_Address: string;
    Token_Withdraw_Token_Address: string;
    Zap_Deposit_Token_Address: string;
    Zap_Withdraw_Token_Address: string;
    TOKEN_PRICE: number;
    ZAP_TOKEN_PRICE: number;
    ID: number;
}

export type DepositFn = (args: DepositArgs) => Promise<void>;
export type WithdrawFn = (args: WithdrawArgs) => Promise<void>;
export type ZapInFn = (args: ZapInArgs) => Promise<void>;
export type ZapOutFn = (args: ZapOutArgs) => Promise<void>;
export type GetFarmDataProcessedFn = (balances: Balances, prices: Prices) => FarmDataProcessed;
export interface FarmFunctions {
    getProcessedFarmData: GetFarmDataProcessedFn;
    deposit: DepositFn;
    withdraw: WithdrawFn;
    zapIn: ZapInFn;
    zapOut: ZapOutFn;
}
export type DynamicFarmFunctions = (farmId: number) => FarmFunctions;
