import { useMemo } from "react";
import { Vault } from "src/types";
import { getLpAddressForFarmsPrice } from "src/utils/common";
import { useFarmApys } from "./farms/useFarmApy";
import useFarms from "./farms/useFarms";
import useFarmsBalances from "./farms/useFarmsBalances";
import usePriceOfTokens from "./usePriceOfTokens";

export const useVaults = (): { vaults: Vault[]; isLoading: boolean } => {
    const { farms } = useFarms();
    const { formattedBalances: usersVaultBalances, isLoading: isLoadingUserBalances } = useFarmsBalances();
    const { prices: priceOfSingleToken, isLoading: isLoadingPricesOfSingleToken } = usePriceOfTokens();
    const { allFarmApys, isLoading: isLoadingApys } = useFarmApys();
    const vaults = useMemo(() => {
        return farms
            .map((farm) => {
                const lpAddress = getLpAddressForFarmsPrice([farm])[0];
                return {
                    ...farm,
                    userVaultBalance: usersVaultBalances[farm.vault_addr],
                    priceOfSingleToken: priceOfSingleToken[lpAddress] || (farm.stableCoin ? 1 : 0),
                    apys: allFarmApys[farm.lp_address],
                };
            })
            .filter((farm) => farm.userVaultBalance * farm.priceOfSingleToken >= 0.01);
    }, [allFarmApys, usersVaultBalances, priceOfSingleToken]);

    return {
        vaults,
        isLoading: isLoadingPricesOfSingleToken || isLoadingApys || isLoadingUserBalances,
    };
};
