import axios from "axios";
import { EARNINGS_GRAPH_URL } from "src/config/constants";

interface Response {
    deposit: string;
    vaultAddress: string;
    withdraw: string;
    blockNumber: string;
    blockTimestamp: string;
    userBalance: string;
    token0: string;
    token1: string;
    reserve0: string;
    reserve1: string;
    totalSupply: string;
    tokenId: string;
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
                    tokenId
                    blockTimestamp
                    userBalance
                    token0
                    token1
                    reserve0
                    reserve1
                    totalSupply
                  }
                }
              }`,
    });

    return res.data.data.user.earn as Response[];
};
