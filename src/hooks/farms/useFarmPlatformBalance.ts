import useFarms from "./useFarms";
import useTotalSupplies from "../useTotalSupplies";

/**
 * Returns total supply for all farms on their respected
 */
const useFarmsPlatformTotalSupply = () => {
    const { farms } = useFarms();
    return useTotalSupplies(farms.map((item) => ({ address: item.lp_address, decimals: item.decimals })));
};

export default useFarmsPlatformTotalSupply;

