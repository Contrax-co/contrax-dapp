import { useMemo } from "react";
import pools from "src/config/constants/pools_json";

const useFarms = () => {
    return { farms: useMemo(() => pools, []) };
};

export default useFarms;
