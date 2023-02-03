import { useEffect, useMemo, useState } from "react";
import { getApy } from "src/api/apy";
import pools from "src/config/constants/pools.json";
import { Apys, Farm, FarmDetails } from "src/types";
import useConstants from "../useConstants";
import usePriceOfTokens from "../usePriceOfTokens";
import { useFarmApys } from "./useFarmApy";
import useFarmsPlatformTotalSupply from "./useFarmPlatformBalance";
import useFarmsVaultBalances from "./useFarmsVaultBalances";
import useFarmsVaultTotalSupply from "./useFarmsVaultTotalSupply";

const farms = pools as Farm[];
const useFarms = (): { farms: Farm[] } => {
    return { farms: useMemo(() => farms, [pools]) };
};

export default useFarms;

export const useFarmDetails = (): { farmDetails: FarmDetails[] } => {
    const { formattedBalances } = useFarmsVaultBalances();
    const { formattedSupplies } = useFarmsVaultTotalSupply();
    const { formattedSupplies: platformSupplies } = useFarmsPlatformTotalSupply();
    const { prices: priceOfSingleToken } = usePriceOfTokens(farms.map((farm) => farm.lp_address));
    const { apys } = useFarmApys();

    const farmDetails = useMemo(() => {
        return farms.map((farm, index) => {
            return {
                ...farm,
                userVaultBal: formattedBalances[farm.vault_addr],
                totalVaultBalance: formattedSupplies[farm.vault_addr],
                totalPlatformBalance: platformSupplies[farm.lp_address],
                priceOfSingleToken: priceOfSingleToken[farm.lp_address] || (farm.stableCoin ? 1 : 0),
                apys: apys[farm.lp_address],
            };
        });
    }, [farms, apys, formattedBalances, formattedSupplies, platformSupplies, priceOfSingleToken]);

    return { farmDetails };
};
