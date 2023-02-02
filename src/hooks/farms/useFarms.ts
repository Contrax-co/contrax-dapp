import { useEffect, useMemo, useState } from "react";
import { getApy } from "src/api/apy";
import pools from "src/config/constants/pools.json";
import { Apys, Farm, FarmDetails } from "src/types";
import useConstants from "../useConstants";
import usePriceOfTokens from "../usePriceOfTokens";
import useFarmsPlatformTotalSupply from "./useFarmPlatformBalance";
import useFarmsVaultBalances from "./useFarmsVaultBalances";
import useFarmsVaultTotalSupply from "./useFarmsVaultTotalSupply";

const farms = pools as Farm[];
const useFarms = (): { farms: Farm[] } => {
    return { farms: useMemo(() => farms, [pools]) };
};

export default useFarms;

export const useFarmDetails = (): { farmDetails: FarmDetails[] } => {
    const { CHAIN_ID } = useConstants();
    const [apysArr, setApys] = useState<Apys[]>([]);

    useEffect(() => {
        Promise.all(farms.map((farm) => getApy(farm, CHAIN_ID)))
            .then((res) => setApys(res))
            .catch((err) => console.log(err));
    }, [farms]);
    const ad = useMemo(() => farms.map((farm) => farm.lp_address), [farms]);
    const { formattedBalances } = useFarmsVaultBalances();
    const { formattedSupplies } = useFarmsVaultTotalSupply();
    const { formattedSupplies: platformSupplies } = useFarmsPlatformTotalSupply();
    const { prices: priceOfSingleToken } = usePriceOfTokens(ad);

    const farmDetails = useMemo(() => {
        return farms.map((farm, index) => ({
            ...farm,
            userVaultBal: formattedBalances[farm.vault_addr],
            totalVaultBalance: formattedSupplies[farm.vault_addr],
            totalPlatformBalance: platformSupplies[farm.lp_address],
            priceOfSingleToken: priceOfSingleToken[farm.lp_address],
            apys: apysArr[index] || {
                feeApr: 0,
                rewardsApr: 0,
                apy: 0,
                compounding: 0,
            },
        }));
    }, [farms, apysArr, formattedBalances, formattedSupplies, platformSupplies, priceOfSingleToken]);
    useEffect(() => {
        console.log("rerender because of priceOfSingleToken");
    }, [priceOfSingleToken]);

    return { farmDetails };
};
