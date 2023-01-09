import { Vault } from "src/types";
import vaultsJson from "src/config/constants/vaults.json";
import useWallet from "../useWallet";

const useVaults = (): { vaults: Vault[] } => {
    return { vaults: vaultsJson };
};

export default useVaults;
