import { CHAIN_ID } from "src/types/enums";

export const RoutesPaths = {
    Home: "/",
    Farms: "/earn",
    Swap: "/swap",
    Bridge: "/bridge",
    Buy: "/buy",
    Mesh: "/import-crypto",
    Stats: "/stats",
    Governance: "/governance",
    ReferralDashboard: "/referral-dashboard",
    Test: "/Test",
    Test_pro_max: "/test_pro_max",
};

export const SNAPSHOT_SPACE_ID = "contrax.eth";
export const SNAPSHOT_APP_NAME = "Contrax Finance";
export const SNAPSHOT_HUB_URL = "https://hub.snapshot.org";
export const SNAPSHOT_GRAPHQL_URL = "https://hub.snapshot.org/graphql";
export const MAX_GAS_UNITS_PER_TRANSACTION = "700000";
export const defaultChainId = CHAIN_ID.ARBITRUM; // Arbitrum
export const defaultNetworkName = "arbitrum";
export const walletConnectProjectId = import.meta.env.REACT_APP_WALLET_CONNECT_PROJECT_ID as string;
export const isDev = import.meta.env.NODE_ENV === "development";
export const isStagging = window.location.hostname.includes("staging.contrax.finance");
export const GATEFI_MERCHANT_ID = import.meta.env.REACT_APP_GATEFI_MERCHANT_ID as string;
export const SOCKET_BRIDGE_KEY = import.meta.env.REACT_APP_SOCKET_BRIDGE_KEY;
export const SOCKET_API_KEY = import.meta.env.REACT_APP_SOCKET_BRIDGE_KEY;
export const RAMP_TRANSAK_API_KEY = import.meta.env.REACT_APP_RAMP_TRANSAK_API_KEY;
export const ZERODEV_PROJECT_ID = import.meta.env.REACT_APP_ZERODEV_PROJECT_ID!;
export const ZERODEV_PROJECT_ID_MAINNET = import.meta.env.REACT_APP_ZERODEV_PROJECT_ID_MAINNET!;
export const IS_LEGACY = import.meta.env.REACT_APP_IS_LEGACY === "true";
export const DODO_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum";
export const FRAX_APR_API_URL = "https://stargate.finance/.netlify/functions/farms";
export const SUSHUISWAP_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/sushi-0m/sushiswap-arbitrum";
export const SHUSHISWAP_CHEF_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/jiro-ono/arbitrum-minichef-staging";
export const SWAPFISH_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/swapfish/swapfish";
export const WEB3AUTH_CLIENT_ID = import.meta.env.REACT_APP_WEB3AUTH_CLIENT_ID;
export const EARNINGS_GRAPH_URL =
    "https://gateway.thegraph.com/api/616d6a1cc1199359a718e468c9aec235/subgraphs/id/6fdsQSH1HoZ7APjNR78C9atxFSuEx2dCcjwx5RBjZgE7";
export const EARNINGS_GRAPH_URL_BASE =
    "https://gateway-arbitrum.network.thegraph.com/api/616d6a1cc1199359a718e468c9aec235/subgraphs/id/D7uDmHS7qoxRwxHPnYNQm2foppkWmi7r2TaH5qZDX2Dh";
export const HOP_EXCHANGE_APY_URL = "https://assets.hop.exchange/v1.1-pool-stats.json";
export const BACKEND_BASE_URL = "https://contrax-backend.herokuapp.com/api/v1/";
export const TENDERLY_ACCESS_TOKEN = import.meta.env.REACT_APP_TENDERLY_ACCESS_TOKEN;
export const TENDERLY_PROJECT_SLUG = import.meta.env.REACT_APP_TENDERLY_PROJECT_SLUG;
export const TENDERLY_USER_NAME = import.meta.env.REACT_APP_TENDERLY_USER_NAME;
export const WERT_PARTNER_ID = import.meta.env.REACT_APP_WERT_PARTNER_ID;
export const POLLING_INTERVAL = 30000;
export const INFURA_KEY = import.meta.env.REACT_APP_INFURA;
export const ALCHEMY_KEY = import.meta.env.REACT_APP_ALCHEMY;

// export const FRONT_URL = import.meta.env.REACT_APP_FRONT_URL_SANDBOX as string;
// export const FRONT_API_KEY = import.meta.env.REACT_APP_FRONT_API_KEY_SANDBOX as string;
export const FRONT_URL = import.meta.env.REACT_APP_FRONT_URL as string;
export const FRONT_API_KEY = import.meta.env.REACT_APP_FRONT_API_KEY as string;
export const FRONT_CLIENT_ID = import.meta.env.REACT_APP_FRONT_CLIENT_ID as string;
