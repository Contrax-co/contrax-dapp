import { SUSHUISWAP_GRAPH_URL, SHUSHISWAP_CHEF_GRAPH_URL } from "src/config/constants/index";
import { FarmOriginPlatform } from "src/types/enums";
import { Apys, Farm } from "src/types";
import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { addressesByChainId } from "src/config/constants/contracts";
import { getPrice } from "./token";
import { BigNumber, utils, providers } from "ethers";
import { calcCompoundingApy, findCompoundAPY, toEth, totalFarmAPY } from "src/utils/common";
import { getGmxApyArbitrum } from "./getGmxApy";

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

export const getSushiswapApy = async (pairAddress: string, chainId: number) => {
    const priceOfSushi = await getPrice(addressesByChainId[chainId].sushiAddress, chainId);

    let query = `{
    pair(id: "${pairAddress}") {
      name
      liquidityUSD
      apr
      feesUSD
      id
    }
  }`;
    let res = await axios.post(SUSHUISWAP_GRAPH_URL, { query });
    let pairData: GraphResponse = res.data.data.pair;
    query = ` {
          miniChefs {
            id
            sushi
            sushiPerSecond
            totalAllocPoint
            pools(where: {pair: "${pairAddress}"}){
              allocPoint
              pair
            }
          }
        }`;
    res = await axios.post(SHUSHISWAP_CHEF_GRAPH_URL, { query });
    const chefData: ChefResponse = res.data.data.miniChefs[0];
    let obj = {
        allocPoint: Number(chefData.pools[0].allocPoint),
        totalAllocPoint: Number(chefData.totalAllocPoint),
        sushiPerSecond: BigNumber.from(chefData.sushiPerSecond),
        sushiPerDay: BigNumber.from(chefData.sushiPerSecond).mul(60).mul(60).mul(24),
        feeApr: Number(pairData.apr) * 100,
        liquidityUSD: Number(pairData.liquidityUSD),
    };
    const sushiRewardPerDay = obj.sushiPerDay;
    const sushiRewardPerYear = sushiRewardPerDay.mul(365);

    const sushiRewardPerYearUSD =
        (Number(toEth(sushiRewardPerYear.toString())) * priceOfSushi * obj.allocPoint) / obj.totalAllocPoint;

    const rewardsApr = (sushiRewardPerYearUSD / obj.liquidityUSD) * 100;
    const feeApr = obj.feeApr;
    const compounding = calcCompoundingApy(rewardsApr);
    const apy = rewardsApr + feeApr + compounding;

    return {
        feeApr,
        rewardsApr,
        apy,
        compounding,
    };
};

export const getApy = async (
    farm: Pick<Farm, "originPlatform" | "lp_address" | "rewards_apy" | "total_apy">,
    chainId: number,
    provider?: providers.Provider,
    currentWallet?: string
): Promise<Apys> => {
    switch (farm.originPlatform) {
        case FarmOriginPlatform.Shushiswap:
            return getSushiswapApy(farm.lp_address.toLowerCase(), chainId);
        case FarmOriginPlatform.GMX:
            return getGmxApyArbitrum(provider, currentWallet);
        default:
            return {
                feeApr: 0,
                rewardsApr: Number(farm.rewards_apy || 0),
                apy: Number(farm.total_apy || 0),
                compounding: 0,
            };
    }
};
