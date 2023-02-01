import { useEffect, useMemo, useState } from "react";
import { getApy } from "src/api/apy";
import pools from "src/config/constants/pools.json";
import { Apys, Farm, FarmDetails } from "src/types";
import useConstants from "../useConstants";
import usePriceOfTokens from "../usePriceOfTokens";
import useFarmApy from "./useFarmApy";
import useFarmsPlatformTotalSupply from "./useFarmPlatformBalance";
import useFarmsApy from "./useFarmsApy";
import useFarmsVaultBalances from "./useFarmsVaultBalances";
import useFarmsVaultTotalSupply from "./useFarmsVaultTotalSupply";

const useFarms = (): { farms: Farm[] } => {
    return { farms: pools as Farm[] };
};

export default useFarms;

const farms = pools as Farm[];
export const useFarmDetails = (): { farmDetails: FarmDetails[] } => {
    const { CHAIN_ID } = useConstants();
    const [apysArr, setApys] = useState<Apys[]>([]);

    useEffect(() => {
        Promise.all(farms.map((farm) => getApy(farm, CHAIN_ID))).then((res) => setApys(res));
    }, [farms]);

    const { formattedBalances } = useFarmsVaultBalances();
    const { formattedSupplies } = useFarmsVaultTotalSupply();
    const { formattedSupplies: platformSupplies } = useFarmsPlatformTotalSupply();
    const { prices: priceOfSingleToken } = usePriceOfTokens(farms.map((farm) => farm.lp_address));

    const farmDetails = useMemo(() => {
        return farms.map((farm, index) => ({
            ...farm,
            userVaultBal: formattedBalances[farm.vault_addr],
            totalVaultBalance: formattedSupplies[farm.vault_addr],
            totalPlatformBalance: platformSupplies[farm.lp_address],
            priceOfSingleToken: priceOfSingleToken[farm.lp_address],
            apys: apysArr[index],
        }));
    }, [farms]);
    return { farmDetails };
};
