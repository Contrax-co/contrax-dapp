import useVaults from "src/hooks/vaults/useVaults";
import useBalances from "../useBalances";

/**
 * Returns balances for all vaults
 */
const useVaultBalances = () => {
    const { vaults } = useVaults();
    return useBalances(vaults.map((item) => ({ address: item.vault_address, decimals: item.decimals || 18 })));
};

export default useVaultBalances;
