// React Query query keys

export const USER_TOKENS = (currentWallet: string, networkId: number) => ["user", "tokens", networkId, currentWallet];

export const TOKEN_BALANCES = (currentWallet: string, addresses: string[], networkName: string) => [
    "token",
    "balances",
    networkName,
    currentWallet,
    addresses.sort(),
];

export const TOKEN_TOTAL_SUPPLIES = (addresses: string[], networkName: string) => [
    "token",
    "totalSupply",
    networkName,
    addresses.sort(),
];

export const TOKEN_PRICE = (address: string, networkName: string) => ["token", "price", networkName, address];

export const FARM_APY = (currentWallet: string, address: string, networkName: string) => [
    "farm",
    "apy",
    networkName,
    currentWallet,
    address,
];

export const FEE_APY = (address: string, networkName: string) => ["feeApy", networkName, address];

export const ACCOUNT_BALANCE = (currentWallet: string, accountAddress: string, networkName: string) => [
    "balance",
    networkName,
    currentWallet,
    accountAddress,
];

export const FARM_ZAP_IN = (currentWallet: string, networkName: string, farmId: number) => [
    "farm",
    "function",
    "zapIn",
    farmId,
    networkName,
    currentWallet,
];

export const FARM_ZAP_OUT = (currentWallet: string, networkName: string, farmId: number) => [
    "farm",
    "function",
    "zapOut",
    farmId,
    networkName,
    currentWallet,
];

export const FARM_DEPOSIT = (currentWallet: string, networkName: string, farmId: number) => [
    "farm",
    "function",
    "deposit",
    farmId,
    networkName,
    currentWallet,
];

export const FARM_WITHDRAW = (currentWallet: string, networkName: string, farmId: number) => [
    "farm",
    "function",
    "withdraw",
    farmId,
    networkName,
    currentWallet,
];

export const CREATE_TOKEN = (currentWallet: string, networkName: string) => [
    "token",
    "function",
    "create",
    networkName,
    currentWallet,
];
