import { useMemo } from "react";
import { Vault } from "src/types";
import { useFarmApys } from "./farms/useFarmApy";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";

export const useVaults = (): { vaults: Vault[]; isLoading: boolean; isFetched: boolean } => {
    const { farms } = useFarms();
    const {
        formattedBalances: usersVaultBalances,
        isLoading: isLoadingUserBalances,
        isFetched: isFetchedUserBalances,
    } = useBalances();
    const {
        prices: priceOfSingleToken,
        isLoading: isLoadingPricesOfSingleToken,
        isFetched: isFetchedPricesOfSingleToken,
    } = usePriceOfTokens();
    const { apys, isLoading: isLoadingApys, isFetched: isFetchedApys } = useFarmApys();

    const vaults = useMemo(() => {
        return farms
            .map((farm) => {
                return {
                    ...farm,
                    userVaultBalance: usersVaultBalances[farm.vault_addr] || 0,
                    priceOfSingleToken: priceOfSingleToken[farm.vault_addr] || (farm.stableCoin ? 1 : 0),
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
        isFetched: isFetchedPricesOfSingleToken && isFetchedApys && isFetchedUserBalances,
    };
};
