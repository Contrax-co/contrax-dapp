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
