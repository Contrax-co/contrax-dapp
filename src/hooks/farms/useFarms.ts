import { useCallback, useMemo } from "react";
import pools from "src/config/constants/pools.json";
import { Farm, FarmDetails } from "src/types";
import { FarmType } from "src/types/enums";
import usePriceOfTokens from "../usePriceOfTokens";
import useTotalSupplies from "../useTotalSupplies";
import { useFarmApys } from "./useFarmApy";
import useFarmsBalances from "./useFarmsBalances";

const farms = pools as Farm[];
const useFarms = (): { farms: Farm[] } => {
    return { farms: useMemo(() => farms, []) };
};

export default useFarms;

export const useFarmDetails = (): {
    farmDetails: FarmDetails[];
    normalFarms: FarmDetails[];
    advancedFarms: FarmDetails[];
} => {
    const { formattedBalances: usersVaultBalances, refetch: usersVaultBalanceRefetch } = useFarmsBalances();
    const { formattedSupplies: totalVaultSupplies, refetch: totalVaultSuppliesRefetch } = useTotalSupplies(
        farms.map((farm) => ({ address: farm.vault_addr, decimals: farm.decimals }))
    );
    const { formattedSupplies: totalPlatformSupplies, refetch: totalPlatformSuppliesRefetch } = useTotalSupplies(
        farms.map((farm) => ({ address: farm.lp_address, decimals: farm.decimals }))
    );
    const { prices: priceOfSingleToken } = usePriceOfTokens(farms.map((farm) => farm.lp_address));
    const { apys } = useFarmApys();

    const refetchBalances = useCallback(() => {
        usersVaultBalanceRefetch();
        totalVaultSuppliesRefetch();
        totalPlatformSuppliesRefetch();
    }, [totalPlatformSuppliesRefetch, totalVaultSuppliesRefetch, usersVaultBalanceRefetch]);

    const farmDetails = useMemo(() => {
        return farms.map((farm) => {
            return {
                ...farm,
                userVaultBalance: usersVaultBalances[farm.vault_addr],
                totalVaultBalance: totalVaultSupplies[farm.vault_addr],
                totalPlatformBalance: totalPlatformSupplies[farm.lp_address],
                priceOfSingleToken: priceOfSingleToken[farm.lp_address] || (farm.stableCoin ? 1 : 0),
                apys: apys[farm.lp_address],
            };
        });
    }, [apys, usersVaultBalances, totalVaultSupplies, totalPlatformSupplies, priceOfSingleToken]);

    const normalFarms = useMemo(() => {
        return farms.reduce((farms: FarmDetails[], farm: Farm) => {
            if (farm.token_type === FarmType.normal) {
                farms.push({
                    ...farm,
                    userVaultBalance: usersVaultBalances[farm.vault_addr],
                    totalVaultBalance: totalVaultSupplies[farm.vault_addr],
                    totalPlatformBalance: totalPlatformSupplies[farm.lp_address],
                    priceOfSingleToken: priceOfSingleToken[farm.lp_address] || (farm.stableCoin ? 1 : 0),
                    apys: apys[farm.lp_address],
                });
            }
            return farms;
        }, []);
    }, [apys, usersVaultBalances, totalVaultSupplies, totalPlatformSupplies, priceOfSingleToken]);

    const advancedFarms = useMemo(() => {
        return farms.reduce((farms: FarmDetails[], farm: Farm) => {
            if (farm.token_type === FarmType.advanced) {
                farms.push({
                    ...farm,
                    userVaultBalance: usersVaultBalances[farm.vault_addr],
                    totalVaultBalance: totalVaultSupplies[farm.vault_addr],
                    totalPlatformBalance: totalPlatformSupplies[farm.lp_address],
                    priceOfSingleToken: priceOfSingleToken[farm.lp_address] || (farm.stableCoin ? 1 : 0),
                    apys: apys[farm.lp_address],
                });
            }
            return farms;
        }, []);
    }, [apys, usersVaultBalances, totalVaultSupplies, totalPlatformSupplies, priceOfSingleToken]);

    return { farmDetails, normalFarms, advancedFarms };
};
