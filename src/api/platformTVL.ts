import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";

interface ResponseDataType {
    data: number;
    status: boolean;
}

export const fetchPlatformTVL = async () => {
    return axios.get<ResponseDataType>(`${BACKEND_BASE_URL}stats/platform-tvl`);
};
