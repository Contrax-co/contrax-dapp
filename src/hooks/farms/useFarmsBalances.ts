import useFarms from "./useFarms";
import useBalances from "../useBalances";
import { useMemo } from "react";

/**
 * Returns balances for all vaults
 */
const useFarmsBalances = () => {
    const { farms } = useFarms();
    const temp = useMemo(() => farms.map((item) => ({ address: item.vault_addr, decimals: item.decimals })), [farms]);

    return useBalances(temp);
};

export default useFarmsBalances;
