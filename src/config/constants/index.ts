import { CHAIN_ID } from "src/types/enums";

export const RoutesPaths = {
    Home: "/",
    Farms: "/farms",
    CreateToken: "/create-token",
    CreatePool: "/create-pool",
    Exchange: "/exchange",
    Buy: "/buy",
};

export const MAX_GAS_UNITS_PER_TRANSACTION = "700000";
export const defaultChainId = CHAIN_ID.ARBITRUM; // Arbitrum
export const defaultNetworkName = "arbitrum";
export const web3AuthConnectorId = "web3auth";

export const GATEFI_MERCHANT_ID = process.env.REACT_APP_GATEFI_MERCHANT_ID as string;
export const SOCKET_BRIDGE_KEY = process.env.REACT_APP_SOCKET_BRIDGE_KEY;
export const SOCKET_API_KEY = process.env.REACT_APP_SOCKET_API_KEY;
export const RAMP_TRANSAK_API_KEY = process.env.REACT_APP_RAMP_TRANSAK_API_KEY;
export const ZERODEV_PROJECT_ID = process.env.REACT_APP_ZERODEV_PROJECT_ID!;
export const ZERODEV_PROJECT_ID_MAINNET = process.env.REACT_APP_ZERODEV_PROJECT_ID_MAINNET!;
export const DODO_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum";
export const FRAX_APR_API_URL = "https://stargate.finance/.netlify/functions/farms";
export const SUSHUISWAP_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/sushi-0m/sushiswap-arbitrum";
export const SHUSHISWAP_CHEF_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/jiro-ono/arbitrum-minichef-staging";
export const SWAPFISH_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/swapfish/swapfish";
export const WEB3AUTH_CLIENT_ID = process.env.REACT_APP_WEB3AUTH_CLIENT_ID;
export const EARNINGS_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/rafay-contrax/contrax-finance-subgraph";
export const HOP_EXCHANGE_APY_URL = "https://assets.hop.exchange/v1.1-pool-stats.json";
export const BACKEND_BASE_URL = "https://contrax-backend.herokuapp.com/api/v1/";
export const TENDERLY_ACCESS_TOKEN = process.env.REACT_APP_TENDERLY_ACCESS_TOKEN;
export const TENDERLY_PROJECT_SLUG = process.env.REACT_APP_TENDERLY_PROJECT_SLUG;
export const TENDERLY_USER_NAME = process.env.REACT_APP_TENDERLY_USER_NAME;
export const WERT_PARTNER_ID = process.env.REACT_APP_WERT_PARTNER_ID;
export const INFURA_KEY = process.env.REACT_APP_INFURA;

export const FRONT_URL = process.env.REACT_APP_FRONT_URL as string;
export const FRONT_API_KEY = process.env.REACT_APP_FRONT_API_KEY as string;
export const FRONT_CLIENT_ID = process.env.REACT_APP_FRONT_CLIENT_ID as string;