export enum FarmTransactionType {
    Deposit = "Deposit",
    Withdraw = "Withdraw",
}
export enum FarmOriginPlatform {
    Shushiswap = "Sushiswap",
    GMX = "GMX",
    Dodo = "Dodo",
    Frax = "Frax",
    Hop = "Hop",
    SwapFish = "SwapFish",
}
export enum FarmTableColumns {
    Token = "Single Token",
    Dual_Token = "Dual Token",
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
}
