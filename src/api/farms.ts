import axios from "axios";
import { EARNINGS_GRAPH_URL, EARNINGS_GRAPH_URL_BASE } from "src/config/constants";
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
        const res_base = await axios.post(EARNINGS_GRAPH_URL_BASE, {
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
        console.log("res_base =>", res_base);
        let responseDataArb =
            (res.data.data.user?.earn.map((item: any) => ({
                ...item,
                chainId: CHAIN_ID.ARBITRUM,
            })) as Response[]) || [];
        let responseDataBase =
            (res_base.data.data.user?.earn.map((item: any) => ({
                ...item,
                chainId: CHAIN_ID.BASE,
            })) as Response[]) || [];
        return responseDataArb.concat(responseDataBase);
    } catch (err: any) {
        console.error(err);
        return undefined;
    }
};
