import { addressesByChainId } from "src/config/constants/contracts";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { getNetworkName } from "src/utils/common";
import useWallet from "./useWallet";

/**
 * Will return constants values according to connected chain network
 */
const useConstants = () => {
    const { networkId: CHAIN_ID } = useWallet();
    const NETWORK_NAME = getNetworkName(CHAIN_ID) || "";
    const CONTRACTS = addressesByChainId[CHAIN_ID] || "";
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[CHAIN_ID] || "";
    return { CHAIN_ID, NETWORK_NAME, CONTRACTS, BLOCK_EXPLORER_URL };
};

export default useConstants;
