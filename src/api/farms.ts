import axios from "axios";
import { EARNINGS_GRAPH_URL } from "src/config/constants";

interface Response {
    deposit: string;
    vaultAddress: string;
    withdraw: string;
    blockNumber: string;
    blockTimestamp: string;
    userBalance: string;
}

export const getEarnings = async (userAddress: string) => {
    const res = await axios.post(EARNINGS_GRAPH_URL, {
        query: `query MyQuery {
                user(id: \"${userAddress.toLowerCase()}\") {
                  earn {
                    vaultAddress
                    deposit
                    withdraw
                    blockNumber
                    blockTimestamp
                    userBalance
                  }
                }
              }`,
    });

    return res.data.data.user.earn as Response[];
};
