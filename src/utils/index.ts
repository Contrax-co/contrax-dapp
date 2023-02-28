import { TokenInfo } from "@uniswap/widgets";
import { ethers } from "ethers";
import { Farm } from "src/types";

export const copyToClipboard = (text: string, cb: Function | null = null) => {
    navigator.clipboard.writeText(text);
    setTimeout(() => {
        if (cb) cb();
    }, 1000);
};

export const getTokenListForUniswap = (farms: Farm[]) => {
    const tokenList: TokenInfo[] = [];
    for (let i = 0; i < farms.length; i++) {
        const farm = farms[i];
        farm.token1 = ethers.utils.getAddress(farm.token1);
        if (farm.token2) farm.token2 = ethers.utils.getAddress(farm.token2);
        // for token 1
        {
            const token1 = {
                address: farm.token1,
                chainId: 42161,
                decimals: farm.decimals1 || farm.decimals,
                name: farm.name.split("-")[0],
                symbol: farm.name.split("-")[0],
            };
            // if token is not duplicate, add it in the list
            if (
                !!token1.name &&
                token1.name !== "ETH" &&
                token1.name !== "WETH" &&
                !tokenList.find((e) => e.address === token1.address)
            ) {
                tokenList.push(token1);
            }
        }
        // for token 2
        {
            if (!farm.token2) continue;
            const token2 = {
                address: farm.token2,
                chainId: 42161,
                decimals: farm.decimals2 || farm.decimals,
                name: farm.name.split("-")[1],
                symbol: farm.name.split("-")[1],
            };
            // if token is not duplicate, add it in the list
            if (
                !!token2.name &&
                token2.name !== "ETH" &&
                token2.name !== "WETH" &&
                !tokenList.find((e) => e.address === token2.address)
            ) {
                tokenList.push(token2);
            }
        }
    }
    return tokenList;
};
