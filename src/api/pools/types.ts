import { BigNumber, Signer } from "ethers";
import { Balances } from "src/state/balances/types";
import { Decimals } from "src/state/decimals/types";
import { Prices } from "src/state/prices/types";
import { Farm, IClients } from "src/types";
import { Address } from "viem";

export interface ZapInArgs {
    amountInWei: bigint;
    chainId: number;
    max?: boolean;
    token: Address;
    balances: Balances;
    prices?: Prices;
    decimals?: Decimals;
    currentWallet: Address;
    tokenIn?: Address;
    client: IClients;
}

export interface ZapOutArgs {
    amountInWei: bigint;
    currentWallet: Address;
    client: IClients;
    chainId: number;
    max?: boolean;
    token: Address;
}

export interface DepositArgs {
    amountInWei: bigint;
    currentWallet: Address;
    client: IClients;
    chainId: number;
    max?: boolean;
}

export interface WithdrawArgs {
    amountInWei: bigint;
    currentWallet: Address;
    client: IClients;
    chainId: number;
    max?: boolean;
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
export type SlippageDepositBaseFn = (args: DepositArgs & { farm: Farm }) => Promise<bigint>;
export type WithdrawFn = (args: WithdrawArgs) => Promise<void>;
export type SlippageWithdrawBaseFn = (args: WithdrawArgs & { farm: Farm }) => Promise<bigint>;
export type ZapInFn = (args: ZapInArgs) => Promise<void>;
export type ZapInBaseFn = (args: ZapInArgs & { farm: Farm }) => Promise<void>;
export type SlippageInBaseFn = (args: ZapInArgs & { farm: Farm }) => Promise<bigint>;
export type SlippageOutBaseFn = (args: ZapOutArgs & { farm: Farm; balances: Balances }) => Promise<bigint>;
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
    zapInSlippage?: SlippageInBaseFn;
    zapOutSlippage?: SlippageOutBaseFn;
    depositSlippage?: SlippageDepositBaseFn;
    withdrawSlippage?: SlippageWithdrawBaseFn;
}
export type DynamicFarmFunctions = (farmId: number) => FarmFunctions;
