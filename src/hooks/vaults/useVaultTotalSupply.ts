import useVaults from "src/hooks/vaults/useVaults";
import useTotalSupplies from "../useTotalSupplies";

/**
 * @description Returns balances for all vaults
 */
const useVaultTotalSupply = () => {
    const { vaults } = useVaults();
    return useTotalSupplies(vaults.map((item) => ({ address: item.vault_address, decimals: item.decimals || 18 })));
};

export default useVaultTotalSupply;
