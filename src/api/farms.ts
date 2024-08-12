import axios from "axios";
import { EARNINGS_GRAPH_URL } from "src/config/constants";
import { CHAIN_ID } from "src/types/enums";

interface Response {
    deposit: string;
    vaultAddress: string;
    withdraw: string;
    blockNumber: string;
    blockTimestamp: string;
    userBalance: string;
    tokenId: string;
    chainId: number;
}

export const getEarnings = async (userAddress: string) => {
    try {
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
                  }
                }
              }`,
        });
        return res.data.data.user?.earn.map((item: any) => ({ ...item, chainId: CHAIN_ID.ARBITRUM })) as Response[];
    } catch (err: any) {
        console.error(err);
        return undefined;
    }
};
