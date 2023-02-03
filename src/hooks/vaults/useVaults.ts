import { Vault } from "src/types";
import vaultsJson from "src/config/constants/vaults.json";

const vaults = vaultsJson as Vault[];

const useVaults = () => {
    return { vaults };
};

export default useVaults;
