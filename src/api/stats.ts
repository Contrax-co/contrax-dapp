import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";
import { Order, AccountDetails } from "src/types";
import { TableColumns } from "src/types/enums";

interface ResponseDataType {
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

export const fetchUserTVLs = async (page: number, sortBy: TableColumns | undefined, order: Order, search: string) => {
    return axios.get<ResponseDataType>(
        `${BACKEND_BASE_URL}stats/tvl?page=${page}&limit=10&sort=${order + sortBy?.toLowerCase()}&address=${search}`
    );
};

export const fetchCountActiveUsers = async () => {
    const res = await axios.get<{ data: { activeUsers: number } }>(`${BACKEND_BASE_URL}stats/count/active-users`);
    return res.data.data.activeUsers;
};
