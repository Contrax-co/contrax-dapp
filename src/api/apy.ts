import { SUSHUISWAP_GRAPH_URL, SHUSHISWAP_CHEF_GRAPH_URL } from "src/config/constants/index";
import { FarmOriginPlatform } from "src/types/enums";
import { Farm } from "src/types";
import axios from "axios";

interface GraphResponse {
    apr: string;
    feesUSD: string;
    id: string;
    liquidityUSD: string;
    name: string;
}

interface ChefResponse {
    id: string;
    sushiPerSecond: string;
    totalAllocPoint: string;
    pools: {
        allocPoint: string;
        pair: string;
    }[];
}

// export const getSushiswapApy = async (pairAddress: string) => {
//   const res = await axios.get(COINS_LLAMA_PRICE + tokenAddress);
//   const prices = JSON.stringify(res.data);
//   const parse = JSON.parse(prices);

//   const price = parse[`coins`][`${NETWORK_NAME}:${tokenAddress}`][`price`];

//     let query = `{
//     pair(id: "${pairAddress}") {
//       name
//       liquidityUSD
//       apr
//       feesUSD
//       id
//     }
//   }`;
//     let res = await axios.post(SUSHUISWAP_GRAPH_URL, { query });
//     let pairData: GraphResponse = res.data.data.pair;
//     query = ` {
//           miniChefs {
//             id
//             sushi
//             sushiPerSecond
//             totalAllocPoint
//             pools(where: {pair: "${pairAddress}"}){
//               allocPoint
//               pair
//             }
//           }
//         }`;
//     res = await axios.post(SHUSHISWAP_CHEF_GRAPH_URL, { query });
//     console.log(res);
//     const chefData: ChefResponse = res.data.data.miniChefs[0];
//     let obj = {
//         allocPoint: BigInt(chefData.pools[0].allocPoint),
//         totalAllocPoint: BigInt(chefData.totalAllocPoint),
//         sushiPerSecond: chefData.sushiPerSecond,
//         sushiPerDay: BigInt(chefData.sushiPerSecond) * BigInt(60) * BigInt(60) * BigInt(24),
//         feeApr: Number(pairData.apr) * 100,
//         liquidityUSD: BigInt(Number(pairData.liquidityUSD).toFixed()),
//     };
//     const sushiRewardPerDay = (obj.sushiPerDay * obj.allocPoint) / obj.totalAllocPoint;
//     const sushiRewardPerYearUSD = sushiRewardPerDay * BigInt(365) * BigInt(sushiPrice);
//     const rewardsApr = sushiRewardPerYearUSD / obj.liquidityUSD;
//     console.log("rewardsApr", rewardsApr, pairAddress);

//     return {
//         feeApr: 0,
//         rewardsApr: 0,
//         apy: 0,
//     };
// };

export const getApy = async (farm: Farm, chainId: number) => {
    // getSushiswapApy(farm.lp_address.toLowerCase());
    return {
        feeApr: 0,
        rewardsApr: 0,
        apy: 0,
    };
};
