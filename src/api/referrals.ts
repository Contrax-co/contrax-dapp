import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";

interface ResponseDataType {
    data: { accounts: string[] };
    status: boolean;
}

export const fetchReferrals = async (currentWallet: string) => {
    return axios.get<ResponseDataType>(`${BACKEND_BASE_URL}account/reffered-accounts/${currentWallet}`);
};
