import { addressesByChainId } from "src/config/constants/contracts";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { getNetworkName } from "src/utils/common";

/**
 * Will return constants values according to connected chain network
 */
const useConstants = (chainId: number) => {
    const NETWORK_NAME = getNetworkName(chainId) || "";
    const CONTRACTS = addressesByChainId[chainId] || "";
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId] || "";
    return { NETWORK_NAME, CONTRACTS, BLOCK_EXPLORER_URL };
};

export default useConstants;
