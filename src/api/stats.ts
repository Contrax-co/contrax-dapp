import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";
import { Order, UserTVL } from "src/types";
import { TableColumns } from "src/types/enums";

interface ResponseDataType {
    data: UserTVL[];
    hasPrevPage: number;
    hasNextPage: number;
    totalPages: number;
    totalDocs: number;
    limit: number;
    status: boolean;
}

export const fetchUserTVLs = async (page: number, sortBy: TableColumns | undefined, order: Order, search: string) => {
    return axios.get<ResponseDataType>(
        `${BACKEND_BASE_URL}stats/tvl?page=${page}&limit=10&sort=${order + sortBy?.toLowerCase()}&address=${search}`
    );
};
