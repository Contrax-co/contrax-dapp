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
    Token = "TOKEN",
    Deposited = "DEPOSITED",
    APY = "APY",
    EARNED = "EARNED",
}

export enum FarmType {
    normal = "Token",
    advanced = "LP Token",
}

export enum TransactionCurrency {
    USDC = "USDC",
    ETH = "ETH",
    LP_Token = "LP Token",
}
