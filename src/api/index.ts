import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";

export const backendApi = axios.create({
    baseURL: BACKEND_BASE_URL,
});

export const isGasSponsored = async (addr: string): Promise<boolean> => {
    const res = await backendApi.get("/settings/should-sponsor?walletAddress=" + addr);
    return res.data.data.willSponsor;
};
