export const VAULT_BALANCES = (currentWallet: string, vaultAddresses: string[], networkName: string) => [
    "vault",
    "balances",
    networkName,
    currentWallet,
    vaultAddresses,
];

export const VAULT_TOKEN_PRICE = (currentWallet: string, vaultAddresses: string, networkName: string) => [
    "vault",
    "tokenPrice",
    networkName,
    currentWallet,
    vaultAddresses,
];
