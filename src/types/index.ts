import { FarmOriginPlatform } from "./enums";

export interface Farm {
    id: number;
    stableCoin?: boolean;
    originPlatform?: FarmOriginPlatform;
    master_chef?: string;
    pool_id?: number;
    token_type: string;
    name: string;
    source: string;
    url_name: string;
    name1: string;
    name2?: string;
    platform: string;
    platform_alt: string;
    total_apy?: number;
    rewards_apy?: number;
    platform_logo: string;
    pair1: string;
    pair2?: string;
    token1: string;
    token2?: string;
    zapper_addr: string;
    zapper_abi: any;
    alt1: string;
    alt2?: string;
    logo1: string;
    logo2?: string;
    rewards1: string;
    rewards1_alt: string;
    rewards2?: string;
    rewards2_alt?: string;
    lp_address: string;
    decimals: number;
    decimals1?: number;
    decimals2?: number;
    vault_addr: string;
    vault_abi: any;
    lp_abi: any;
    withdraw_decimals?: number;
    vault_decimals?: number;
}
export interface FarmDetails extends Farm {
    userVaultBalance: number;
    totalVaultBalance: number;
    totalPlatformBalance: number;
    priceOfSingleToken: number;
    apys: Apys;
}

export interface Vault extends Farm {
    userVaultBalance: number;
    priceOfSingleToken: number;
    apys: Apys;
}

export interface Apys {
    feeApr: number;
    rewardsApr: number;
    apy: number;
    compounding: number;
}

export interface Token {
    address: string;
    name: string;
    logo: string;
    balance: string;
    usdBalance: string;
    decimals: number;
    network?: string;
}

export interface CovalentToken {
    balance: string;
    balance_24h: string;
    contract_address: string;
    contract_decimals: number;
    contract_name: string;
    contract_ticker_symbol: string;
    last_transferred_at: unknown;
    logo_url: string;
    native_token: boolean;
    nft_data: unknown;
    quote: number;
    quote_24h: unknown;
    quote_rate: number;
    quote_rate_24h: unknown;
    supports_erc: unknown;
    type: string;
}

export interface CreateToken {
    name: string;
    symbol: string;
    decimal: number;
    burnPercantageIdentifier: boolean;
    initialSupply: number;
    mintable: boolean;
    burnPercentage: number;
    transactionFeePercentage: number;
    transactionFeePercentageIdentiier: boolean;
}

export interface FarmData {
    /**
     * Farm Id
     */
    ID: number;
    /**
     * When Zapping in deposit column the max amount in token
     */
    Max_Zap_Deposit_Balance: string;
    /**
     * When Zapping in deposit column the max amount in token in Dollar
     */
    Max_Zap_Deposit_Balance_Dollar: string;
    /**
     * When Depositing in deposit column the max amount in token
     */
    Max_Token_Deposit_Balance: string;
    /**
     * When Depositing in deposit column the max amount in token in Dollar
     */
    Max_Token_Deposit_Balance_Dollar: string;
    /**
     * When Zapping in withdraw column the max amount in token
     */
    Max_Zap_Withdraw_Balance: string;
    /**
     * When Zapping in withdraw column the max amount in token in Dollar
     */
    Max_Zap_Withdraw_Balance_Dollar: string;
    /**
     * When Withdrawing in withdraw column the max amount in token
     */
    Max_Token_Withdraw_Balance: string;
    /**
     * When Withdrawing in withdraw column the max amount in token in Dollar
     */
    Max_Token_Withdraw_Balance_Dollar: string;
    /**
     * Token address of zapping token in deposit column
     */
    Zap_Deposit_Token_Address: string;
    /**
     * Token address of depositing token in deposit column
     */
    Token_Deposit_Token_Address: string;
    /**
     * Token address of zapping token in withdraw column
     */
    Zap_Withdraw_Token_Address: string;
    /**
     * Token address of withdrawing token in withdraw column
     */
    Token_Withdraw_Token_Address: string;
    /**
     * Token symbol for zap
     */
    Zap_Token_Symbol: string;
    /**
     * Token symbol for deposit or withdraw
     */
    Token_Token_Symbol: string;
    /**
     * Zap Enabled or not, used in showing zap toggle
     */
    Zap_Enabled?: boolean;
    /**
     * Price of token when depositing or withdrawing
     */
    TOKEN_PRICE: number;
    /**
     * Price of token which is used in zapping
     */
    ZAP_TOKEN_PRICE: number;
}
