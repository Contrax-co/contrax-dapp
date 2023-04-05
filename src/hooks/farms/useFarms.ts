import { useMemo } from "react";
import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";

const farms = pools as Farm[];
const useFarms = (): { farms: Farm[] } => {
    return { farms: useMemo(() => farms, []) };
};

export default useFarms;
