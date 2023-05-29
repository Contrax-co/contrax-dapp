import axios from "axios";
import { FRONT_API_KEY, FRONT_CLIENT_ID, FRONT_URL } from "src/config/constants";

export const frontApi = axios.create({
    baseURL: FRONT_URL,
    headers: {
        "Content-Type": "application/json",
        "X-Client-Id": FRONT_CLIENT_ID,
        "X-Client-Secret": FRONT_API_KEY,
    },
});

export const getCatalogLink = async (userId: string) => {
    try {
        const res = await frontApi.get("/api/v1/cataloglink" + `?userId=${userId}&enableTransfers=true`);
        console.log(res.data, res.data.content.iFrameUrl.replace("'", ""));
        return res.data.content.iFrameUrl.replace("'", "");
    } catch (error) {
        console.error(error);
    }
};
