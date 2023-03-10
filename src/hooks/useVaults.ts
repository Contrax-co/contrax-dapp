import { useMemo } from "react";
import { Vault } from "src/types";
import { getLpAddressForFarmsPrice } from "src/utils/common";
import { useFarmApys } from "./farms/useFarmApy";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";

export const useVaults = (): { vaults: Vault[]; isLoading: boolean } => {
    const { farms } = useFarms();
    const { formattedBalances: usersVaultBalances, isLoading: isLoadingUserBalances } = useBalances();
    const { prices: priceOfSingleToken, isLoading: isLoadingPricesOfSingleToken } = usePriceOfTokens();
    const { apys, isLoading: isLoadingApys } = useFarmApys();

    const vaults = useMemo(() => {
        return farms
            .map((farm) => {
                const lpAddress = getLpAddressForFarmsPrice([farm])[0];
                return {
                    ...farm,
                    userVaultBalance: usersVaultBalances[farm.vault_addr] || 0,
                    priceOfSingleToken: priceOfSingleToken[lpAddress] || (farm.stableCoin ? 1 : 0),
                    apys: apys[farm.id],
                };
            })
            .filter(
                (farm) =>
                    farm?.userVaultBalance &&
                    farm?.priceOfSingleToken &&
                    farm.userVaultBalance * farm.priceOfSingleToken >= 0.01
            );
    }, [apys, usersVaultBalances, priceOfSingleToken]);

    return {
        vaults,
        isLoading: isLoadingPricesOfSingleToken || isLoadingApys || isLoadingUserBalances,
    };
};
