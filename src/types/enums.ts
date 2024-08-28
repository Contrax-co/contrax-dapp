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
