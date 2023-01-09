export interface Vault {
    id: number;
    vault_address: string;
    decimals?: number;
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
    vault_abi: any;
}

export interface Farm {
    id: number;
    token_type: string;
    name: string;
    platform: string;
    platform_alt: string;
    total_apy?: number;
    rewards_apy?: number;
    platform_logo: string;
    pair1: string;
    pair2?: string;
    token1: string;
    token2?: string;
    zapper_addr: string;
    zapper_abi: any;
    alt1: string;
    alt2?: string;
    logo1: string;
    logo2?: string;
    rewards1: string;
    rewards1_alt: string;
    rewards2?: string;
    rewards2_alt?: string;
    lp_address: string;
    decimals: number;
    vault_addr: string;
    vault_abi: any;
    lp_abi: any;
}
