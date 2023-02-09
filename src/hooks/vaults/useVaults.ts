import { Farm } from "src/types";
import vaultsJson from "src/config/constants/pools.json";

const vaults = vaultsJson as Farm[];

const useVaults = () => {
    return { vaults };
};

export default useVaults;
