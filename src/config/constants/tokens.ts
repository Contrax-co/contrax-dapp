import { CHAIN_ID } from "src/types/enums";
import traxLogo from "./../../assets/images/contrax_leaf.png";

const tokens = [
    {
        address: "0x42Fd79DAF2a847B59D487650C68c2D7E52D752f6",
        name: "xTrax",
        logo: traxLogo,
        decimals: 18,
        chainId: CHAIN_ID.ARBITRUM,
    },
    {
        address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        name: "Arbitrum",
        logo: "https://arbiscan.io/token/images/arbitrumone2_32_new.png",
        decimals: 18,
        chainId: CHAIN_ID.ARBITRUM,
    },
    {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        name: "USDC",
        logo: "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png",
        decimals: 6,
        chainId: CHAIN_ID.BASE,
    },
    {
        address: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9",
        name: "USDC",
        logo: "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png",
        decimals: 6,
        chainId: CHAIN_ID.CORE,
    },
] as const;

export default tokens;
