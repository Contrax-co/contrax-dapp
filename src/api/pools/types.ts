import { BigNumber, Signer } from "ethers";
import { Balances } from "src/state/balances/types";
import { Decimals } from "src/state/decimals/types";
import { Prices } from "src/state/prices/types";
import { Farm } from "src/types";

export interface ZapInArgs {
    amountInWei: string | BigNumber;
    signer?: Signer;
    chainId: number;
    max?: boolean;
    token: string;
    balances: Balances;
    currentWallet: string;
    tokenIn?: string;
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
    amountInWei: string | BigNumber;
    currentWallet: string;
    signer?: Signer;
    chainId: number;
    max?: boolean;
}

export interface WithdrawArgs {
    amountInWei: string | BigNumber;
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
export type WithdrawFn = (args: WithdrawArgs) => Promise<void>;
export type ZapInFn = (args: ZapInArgs) => Promise<void>;
export type ZapInBaseFn = (args: ZapInArgs & { farm: Farm }) => Promise<void>;
export type ZapOutFn = (args: ZapOutArgs) => Promise<void>;
export type ZapOutBaseFn = (args: ZapOutArgs & { farm: Farm }) => Promise<void>;
export type GetFarmDataProcessedFn = (
    balances: Balances,
    prices: Prices,
    decimals: Partial<Decimals>,
    vaultTotalSupply: string | undefined
) => FarmDataProcessed;
export interface FarmFunctions {
    getProcessedFarmData: GetFarmDataProcessedFn;
    deposit: DepositFn;
    withdraw: WithdrawFn;
    zapIn: ZapInFn;
    zapOut: ZapOutFn;
    zapInSlippage?: ZapInFn;
}
export type DynamicFarmFunctions = (farmId: number) => FarmFunctions;
