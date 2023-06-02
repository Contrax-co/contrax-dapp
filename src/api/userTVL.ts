import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";
import { UserTVL } from "src/types";

interface ResponseDataType {
    data: UserTVL;
    status: boolean;
}

export const fetchUserTVL = async (address: string) => {
    return axios.get<ResponseDataType>(`${BACKEND_BASE_URL}stats/tvl/${address}`);
};
