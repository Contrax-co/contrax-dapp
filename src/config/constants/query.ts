// React Query query keys

export const TOKEN_BALANCES = (currentWallet: string, addresses: string[], networkName: string) => [
    "token",
    "balances",
    networkName,
    currentWallet,
    addresses,
];

export const TOKEN_TOTAL_SUPPLIES = (currentWallet: string, addresses: string[], networkName: string) => [
    "token",
    "totalSupply",
    networkName,
    currentWallet,
    addresses,
];

export const TOKEN_PRICE = (currentWallet: string, address: string, networkName: string) => [
    "token",
    "price",
    networkName,
    currentWallet,
    address,
];

export const FARM_APY = (currentWallet: string, address: string, networkName: string) => [
    "farm",
    "apy",
    networkName,
    currentWallet,
    address,
];

export const FEE_APY = (currentWallet: string, address: string, networkName: string) => [
    "feeApy",
    networkName,
    currentWallet,
    address,
];

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
