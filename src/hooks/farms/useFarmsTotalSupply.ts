import useFarms from "./useFarms";
import useTotalSupplies from "../useTotalSupplies";

/**
 * Returns total supply for all vaults
 */
const useFarmsTotalSupply = () => {
    const { farms } = useFarms();
    return useTotalSupplies(farms.map((item) => ({ address: item.vault_addr, decimals: item.decimals })));
};

export default useFarmsTotalSupply;
