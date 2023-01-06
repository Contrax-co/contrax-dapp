import { addressesByChainId } from "./contracts";
import { blockExplorersByChainId, coinsLamaPriceByChainId } from "./urls";

export const RoutesPaths = {
    Home: "/",
    Farms: "/farms",
    CreateToken: "/create-token",
    CreatePool: "/create-pool",
    Exchange: "/exchange",
};

export const defaultChainId = 0xa4b1; // Arbitrum
export const NETWORK_NAME = "arbitrum";

export const Contracts = addressesByChainId[defaultChainId];
export const BLOCK_EXPLORER_URL = blockExplorersByChainId[defaultChainId];
export const COINS_LLAMA_PRICE = coinsLamaPriceByChainId[defaultChainId];
export const APY_TOKEN = process.env.REACT_APP_APY_TOKEN;
export const APY_VISION_URL = "https://api.apy.vision";
