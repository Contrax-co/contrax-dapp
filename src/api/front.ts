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

export const getLinkToken = async (userId: string) => {
    try {
        const res = await frontApi.post("/api/v1/linkToken", {
            userId,
            transferOptions: {
                toAddresses: [
                    {
                        networkId: "a34f2431-0ddd-4de4-bc22-4a8143287aeb",
                        symbol: "USDC",
                        address: userId,
                    },
                    {
                        networkId: "a34f2431-0ddd-4de4-bc22-4a8143287aeb",
                        symbol: "ETH",
                        address: userId,
                    },
                ],
            },
            fundingOptions: {
                enabled: true,
            },
        });
        return res.data?.content?.linkToken as string;
    } catch (error) {
        return { status: "failed" };
    }
};
