import useFarms from "./useFarms";
import useTotalPlatformSupplies from "../useTotalPlatformSupplies";

/**
 * Returns total supply for all farms on their respected
 */
const useFarmsPlatformTotalSupply = () => {
    const { farms } = useFarms();
    return useTotalPlatformSupplies(farms.map((item) => ({ address: item.lp_address, decimals: item.decimals })));
};

export default useFarmsPlatformTotalSupply;

