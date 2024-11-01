export enum FarmTransactionType {
    Deposit = "Deposit",
    Withdraw = "Withdraw",
}
export enum FarmOriginPlatform {
    Shushiswap = "Sushiswap",
    Peapods = "Peapods",
    GMX = "GMX",
    Dodo = "Dodo",
    Frax = "Frax",
    Hop = "Hop",
    SwapFish = "SwapFish",
    Clipper = "Clipper",
    Steer = "Steer",
    Core = "Core",
    Gamma = "Gamma",
}
export enum FarmTableColumns {
    Token = "Vaults",
    Dual_Token = "Advanced Vaults",
    Deposited = "Deposited",
    APY = "Apy",
    EARNED = "Earned",
}

export enum FarmType {
    normal = "Token",
    advanced = "LP Token",
}

export enum CHAIN_ID {
    MAINNET = 1,
    POLYGON = 137,
    ARBITRUM = 42161,
    LINEA = 59144,
    OPTIMISM = 10,
    BASE = 8453,
    CORE = 1116,
}
export enum FarmSortOptions {
    Default = "Default",
    APY_Low_to_High = "APY: Low to High",
    APY_High_to_Low = " APY: High to Low",
    Deposit_High_to_Low = "Deposit: High to Low",
    Deposit_Low_to_High = "Deposit: Low to High",
    Farms_Onchain = "Farms: Onchain",
    Farms_Cross_Chain = "Farms: Cross Chain",
}

export enum UsersTableColumns {
    Address = "address",
    TVL = "tvl",
    Referrer = "referrer",
    TraxEarned = "earnedTrax",
    TraxEarnedRefferal = "earnedTraxByReferral",
}

export enum VaultsTableColumns {
    Title = "Title",
    DepositedTvl = "Deposited Tvl",
    AverageDeposits = "Average Deposits",
    NoOfDeposits = "No of Deposits",
}
