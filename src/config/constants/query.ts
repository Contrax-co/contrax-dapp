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

export const FARM_DATA = (currentWallet: string, networkName: string, farmId: number) => [
    "farm",
    "data",
    farmId,
    networkName,
    currentWallet,
];

export const TRANSFER_TOKEN = (currentWallet: string, networkName: string) => [
    "token",
    "function",
    "transfer",
    networkName,
    currentWallet,
];
