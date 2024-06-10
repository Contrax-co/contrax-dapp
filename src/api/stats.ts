import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";
import { Order, AccountDetails } from "src/types";
import { UsersTableColumns } from "src/types/enums";

interface UserStatsResponse {
    data: AccountDetails[];
    limit: number;
    page: number;
    hasPrevPage: number;
    hasNextPage: number;
    totalPages: number;
    totalDocs: number;
    meanTvl: number;
    medianTvl: number;
    modeTvl: number;
    status: boolean;
}

interface VaultStatsResponse {
    data: {
        vaults: VaultStats[];
    };
    status: boolean;
}

interface ReferralDashboardResponse {
    data: ReferralStats[];
    status: boolean;
}

export interface ReferralStats {
    address: string;
    tvlFromReferrals: number;
    referreredAddresses: string[];
}

interface VaultStats {
    address: string;
    name?: string;
    averageDeposit: number;
    depositedTvl: number;
    numberOfDeposits: number;
    _id: string;
}

interface VaultsApyResponse {
    data: VaultsApy[];
}

export interface VaultsApy {
    apy: number;
    timestamp: number;
}

export interface BoostedApy {
    aprBoost: number;
}

export interface LP_Prices {
    lp: number;
    timestamp: number;
}

interface LP_PricesResponse {
    data: LP_Prices[];
}

export const fetchUserTVLs = async (
    page: number,
    sortBy: UsersTableColumns | undefined,
    order: Order,
    search: string
) => {
    return axios.get<UserStatsResponse>(
        `${BACKEND_BASE_URL}stats/tvl?page=${page}&limit=10&sort=${order + sortBy}&address=${search}`
    );
};

export const fetchCountActiveUsers = async () => {
    const res = await axios.get<{ data: { activeUsers: number } }>(`${BACKEND_BASE_URL}stats/count/active-users`);
    return res.data.data.activeUsers;
};

export const fetchVaultStats = async () => {
    const res = await axios.get<VaultStatsResponse>(`${BACKEND_BASE_URL}stats/tvl/vaults`);
    return res.data.data.vaults;
};

export const fetchReferralDashboard = async () => {
    const res = await axios.get<ReferralDashboardResponse>(`${BACKEND_BASE_URL}stats/referral-dashboard`);
    return res.data.data;
};

export const fetchSpecificFarmApy = async (id: number) => {
    const res = await axios.get<VaultsApyResponse>(`${BACKEND_BASE_URL}stats/apy/30d?farmId=${id}`);
    return res.data.data;
};

export const fetchBoostedApy = async () => {
    const res = await axios.get<BoostedApy>(`${BACKEND_BASE_URL}stats/arb`);
    return res.data;
};

export const fetchSpecificLpPrice = async (id: number) => {
    const res = await axios.get<LP_PricesResponse>(`${BACKEND_BASE_URL}stats/lp/30d?farmId=${id}`);
    return res.data.data;
};
