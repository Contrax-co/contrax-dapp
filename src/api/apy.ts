import { backendApi } from ".";

export const fetchApysApi = async () => {
    const res = await backendApi.get("vault/apy");
    return res.data.data;
};
