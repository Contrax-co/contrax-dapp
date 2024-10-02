// React Query query keys
export const ACCOUNT_BALANCE = (currentWallet: string, accountAddress: string, networkName: string) => [
    "balance",
    networkName,
    currentWallet,
    accountAddress,
];

export const GET_PRICE_TOKEN = (networkName: string, tokenAddress: string) => [
    "price",
    "token",
    networkName,
    tokenAddress,
];

export const FARM_ZAP_IN = (currentWallet: string, farmId: number) => ["farm", "function", "zapIn", farmId, currentWallet];

export const FARM_ZAP_OUT = (currentWallet: string, farmId: number) => ["farm", "function", "zapOut", farmId, currentWallet];

export const FARM_DEPOSIT = (currentWallet: string, farmId: number) => ["farm", "function", "deposit", farmId, currentWallet];

export const FARM_WITHDRAW = (currentWallet: string, farmId: number) => [
    "farm",
    "function",
    "withdraw",
    farmId,
    currentWallet,
];

export const FARM_DATA = (currentWallet: string, networkName: string, farmId: number) => [
    "farm",
    "data",
    farmId,
    networkName,
    currentWallet,
];

export const TRANSFER_TOKEN = (currentWallet: string) => ["token", "function", "transfer", currentWallet];

export const REFFERED_ACCOUNTS = (currentWallet: string) => ["accounts", "reffered-accounts", currentWallet];

export const VAULT_APY_GRAPH = (farmId: number) => ["stats", "apy", "30d", farmId];
export const VAULT_LP_PRICE_GRAPH = (farmId: number) => ["stats", "lp", "price", "30d", farmId];
