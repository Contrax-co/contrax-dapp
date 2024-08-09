import { PoolDef } from "src/config/constants/pools_json";
import { Balances } from "src/state/balances/types";
import { Decimals } from "src/state/decimals/types";
import { Prices } from "src/state/prices/types";
import { IClients } from "src/types";
import { Address } from "viem";

export interface ZapInArgs {
    amountInWei: bigint;
    max?: boolean;
    token: Address;
    balances: Balances;
    prices?: Prices;
    decimals?: Decimals;
    currentWallet: Address;
    tokenIn?: Address;
    getClients: (chainId: number) => Promise<IClients>;
}

export interface ZapOutArgs {
    amountInWei: bigint;
    currentWallet: Address;
    max?: boolean;
    token: Address;
    getClients: (chainId: number) => Promise<IClients>;
}

export interface DepositArgs {
    amountInWei: bigint;
    currentWallet: Address;
    max?: boolean;
    getClients: (chainId: number) => Promise<IClients>;
}

export interface WithdrawArgs {
    amountInWei: bigint;
    currentWallet: Address;
    max?: boolean;
    getClients: (chainId: number) => Promise<IClients>;
}

export interface TokenAmounts {
    amount: string;
    amountDollar: string;
    tokenAddress: Address;
    tokenSymbol: string;
    price: number;
    /**
     * If true, this token is the primary vault token, We show this token in the balance columns of table
     * @type {boolean}
     */
    isPrimaryVault?: boolean;
}

export interface FarmDataProcessed {
    depositableAmounts: TokenAmounts[];
    withdrawableAmounts: TokenAmounts[];
    vaultBalanceFormated: string;
    id: number;
}

export type DepositFn = (args: DepositArgs) => Promise<void>;
export type SlippageDepositBaseFn = (args: DepositArgs & { farm: PoolDef }) => Promise<bigint>;
export type WithdrawFn = (args: WithdrawArgs) => Promise<void>;
export type SlippageWithdrawBaseFn = (args: WithdrawArgs & { farm: PoolDef }) => Promise<bigint>;
export type ZapInFn = (args: ZapInArgs) => Promise<void>;
export type ZapInBaseFn = (args: ZapInArgs & { farm: PoolDef }) => Promise<void>;
export type SlippageInBaseFn = (args: ZapInArgs & { farm: PoolDef }) => Promise<bigint>;
export type SlippageOutBaseFn = (args: ZapOutArgs & { farm: PoolDef; balances: Balances }) => Promise<bigint>;
export type ZapOutFn = (args: ZapOutArgs) => Promise<void>;
export type ZapOutBaseFn = (args: ZapOutArgs & { farm: PoolDef }) => Promise<void>;
export type GetFarmDataProcessedFn = (
    balances: Balances,
    prices: Prices,
    decimals: Decimals,
    vaultTotalSupply: string | undefined
) => FarmDataProcessed;
export interface FarmFunctions {
    getProcessedFarmData: GetFarmDataProcessedFn;
    deposit: DepositFn;
    withdraw: WithdrawFn;
    zapIn: ZapInFn;
    zapOut: ZapOutFn;
    zapInSlippage?: SlippageInBaseFn;
    zapOutSlippage?: SlippageOutBaseFn;
    depositSlippage?: SlippageDepositBaseFn;
    withdrawSlippage?: SlippageWithdrawBaseFn;
}
export type DynamicFarmFunctions = (farmId: number) => FarmFunctions;
