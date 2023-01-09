import useFarms from "./useFarms";
import useTotalSupplies from "../useTotalSupplies";

/**
 * @description Returns total supply for all vaults
 */
const useFarmsVaultTotalSupply = () => {
    const { farms } = useFarms();
    return useTotalSupplies(farms.map((item) => ({ address: item.vault_addr, decimals: item.decimals })));
};

export default useFarmsVaultTotalSupply;
