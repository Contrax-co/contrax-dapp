import { PoolDef } from "src/config/constants/pools_json";
import { Balances } from "src/state/balances/types";
import { Decimals } from "src/state/decimals/types";
import { Prices } from "src/state/prices/types";
import { EstimateTxGasArgs, IClients } from "src/types";
import { Address } from "viem";

export interface ZapInArgs {
    id: string;
    amountInWei: bigint;
    max?: boolean;
    token: Address;
    balances: Balances;
    prices?: Prices;
    decimals?: Decimals;
    currentWallet: Address;
    tokenIn?: Address;
    isSocial: boolean;
    estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
    getClients: (chainId: number) => Promise<IClients>;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
}

export interface ZapOutArgs {
    id: string;
    amountInWei: bigint;
    currentWallet: Address;
    max?: boolean;
    isSocial: boolean;
    token: Address;
    estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
    getClients: (chainId: number) => Promise<IClients>;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
}

export interface DepositArgs {
    amountInWei: bigint;
    currentWallet: Address;
    max?: boolean;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
}

export interface WithdrawArgs {
    amountInWei: bigint;
    currentWallet: Address;
    max?: boolean;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
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
    isCrossChain: boolean;
    id: number;
}

export interface SlippageOutArgs {
    difference: bigint;
    isBridged?: boolean;
}

export type DepositFn = (args: DepositArgs) => Promise<void>;
export type SlippageDepositBaseFn = (args: DepositArgs & { farm: PoolDef }) => Promise<bigint>;
export type WithdrawFn = (args: WithdrawArgs) => Promise<void>;
export type SlippageWithdrawBaseFn = (args: WithdrawArgs & { farm: PoolDef }) => Promise<bigint>;
export type ZapInFn = (args: ZapInArgs) => Promise<void>;
export type ZapInBaseFn = (args: ZapInArgs & { farm: PoolDef }) => Promise<void>;
export type SlippageInBaseFn = (args: ZapInArgs & { farm: PoolDef }) => Promise<SlippageOutArgs>;
export type SlippageOutBaseFn = (args: ZapOutArgs & { farm: PoolDef; balances: Balances }) => Promise<SlippageOutArgs>;
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
