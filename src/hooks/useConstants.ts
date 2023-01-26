import { Addresses, addressesByChainId } from "src/config/constants/contracts";
import { blockExplorersByChainId, coinsLamaPriceByChainId } from "src/config/constants/urls";
import useWallet from "./useWallet";

/**
 * Will return constants values according to connected chain network
 */
const useConstants = () => {
    const { networkId: CHAIN_ID } = useWallet();
    const NETWORK_NAME = getNetworkName(CHAIN_ID) || "";
    const CONTRACTS = addressesByChainId[CHAIN_ID] || "";
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[CHAIN_ID] || "";
    const COINS_LLAMA_PRICE = coinsLamaPriceByChainId[CHAIN_ID] || "";

    return { CHAIN_ID, NETWORK_NAME, CONTRACTS, BLOCK_EXPLORER_URL, COINS_LLAMA_PRICE };
};

export default useConstants;

function getNetworkName(id: number) {
    switch (id) {
        case 42161:
            return "arbitrum";
        case 1:
            return "mainnet";
        default:
            return "arbitrum";
    }
}

