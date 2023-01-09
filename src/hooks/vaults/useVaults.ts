import { Vault } from "src/types";
import vaultsJson from "src/config/constants/vaults.json";
import useWallet from "../useWallet";

const useVaults = () => {
    return { vaults: vaultsJson as Vault[] };
};

export default useVaults;
