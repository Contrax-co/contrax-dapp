import { useMemo } from "react";
import pools from "src/config/constants/pools.json";
import { Farm, FarmDetails } from "src/types";
import { FarmType } from "src/types/enums";
import { getLpAddressForFarmsPrice } from "src/utils/common";
import usePriceOfTokens from "../usePriceOfTokens";
import useTotalSupplies from "../useTotalSupplies";
import { useFarmApys } from "./useFarmApy";
import useFarmsBalances from "./useFarmsBalances";

const farms = pools as Farm[];
const useFarms = (): { farms: Farm[] } => {
    return { farms: useMemo(() => farms, []) };
};

export default useFarms;
