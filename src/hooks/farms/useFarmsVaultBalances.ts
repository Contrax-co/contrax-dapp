import useFarms from "./useFarms";
import useBalances from "../useBalances";

/**
 * Returns balances for all vaults
 */
const useFarmsVaultBalances = () => {
    const { farms } = useFarms();
    return useBalances(farms.map((item) => ({ address: item.vault_addr, decimals: item.decimals })));
};

export default useFarmsVaultBalances;
