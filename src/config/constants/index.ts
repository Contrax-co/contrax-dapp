export const RoutesPaths = {
    Home: "/",
    Farms: "/farms",
    CreateToken: "/create-token",
    CreatePool: "/create-pool",
    Exchange: "/exchange",
};

export const MAX_GAS_UNITS_PER_TRANSACTION = "3000000";
export const defaultChainId = 42161; // Arbitrum
export const defaultNetworkName = "arbitrum";

export const SOCKET_API_KEY = process.env.REACT_APP_SOCKET_API_KEY;
export const RAMP_SDK_HOST_API_KEY = process.env.REACT_APP_RAMP_SDK_HOST_API_KEY;
export const RAMP_TRANSAK_API_KEY = process.env.REACT_APP_RAMP_TRANSAK_API_KEY;
export const DODO_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum";
export const FRAX_APR_API_URL = "https://stargate.finance/.netlify/functions/farms";
export const SUSHUISWAP_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/sushi-0m/sushiswap-arbitrum";
export const SHUSHISWAP_CHEF_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/jiro-ono/arbitrum-minichef-staging";
export const SWAPFISH_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/swapfish/swapfish";
export const WEB3AUTH_CLIENT_ID = process.env.REACT_APP_WEB3AUTH_CLIENT_ID;
export const EARNINGS_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/rafay-contrax/contrax-finance-subgraph";
export const HOP_EXCHANGE_APY_URL = "https://assets.hop.exchange/v1.1-pool-stats.json";