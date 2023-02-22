import { useMemo } from "react";
import { useFarmDetails } from "./farms/useFarms";

export const useVaults = () => {
    const { farmDetails, isLoading } = useFarmDetails();
    const vaults = useMemo(
        () => farmDetails.filter((farm) => farm.userVaultBalance * farm.priceOfSingleToken >= 0.01),
        []
    );
    return { vaults, isLoading };
};
