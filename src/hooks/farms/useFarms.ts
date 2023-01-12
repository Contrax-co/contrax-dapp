import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";

const useFarms = (): { farms: Farm[] } => {
    return { farms: pools };
};

export default useFarms;
