import { useMemo } from "react";
import { FarmDetails } from "src/types";
import useFarmDetails from "./farms/useFarmDetails";

export const useVaults = () => {
    // const { farmData, isLoading } = useFarmDetails();
    // const vaults = useMemo(
    //     () => farmDetails.filter((farm) => farm.userVaultBalance * farm.priceOfSingleToken >= 0.01),
    //     [farmDetails]
    // );
    return { vaults: [] as FarmDetails[], isLoading: false };
};
