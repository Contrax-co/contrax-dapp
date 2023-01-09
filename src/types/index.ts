export interface Vault {
    id: number;
    vault_address: string;
    decimals: number;
    name: string;
    platform: string;
    logo1: string;
    alt1: string;
    logo2?: string;
    alt2?: string;
    lp_address: string;
    rewards1: string;
    rewards1_alt: string;
    rewards2?: string;
    rewards2_alt?: string;
    total_apy?: number;
    rewards_apy?: number;
    vault_abi: [any];
}
