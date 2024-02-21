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
