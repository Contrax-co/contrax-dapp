import axios from "axios";
import { EARNINGS_GRAPH_URL } from "src/config/constants";

export interface Response {
    id: string;
    earn: {
        userBalance: string;
        vaultAddress: string;
    }[];
}

export const getUserTVLs = async (page: number) => {
    try {
        const res = await axios.post(EARNINGS_GRAPH_URL, {
            query: `query MyQuery {
              users(skip: ${(page - 1) * 10}, first: 10) {
                id
                earn {
                  vaultAddress
                  userBalance
                }
              }
            }`,
        });
        return res.data.data.users as Response[];
    } catch (err: any) {
        console.error(err);
        return undefined;
    }
};
