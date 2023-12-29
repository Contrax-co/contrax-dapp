import { CHAIN_ID } from "src/types/enums";
import traxLogo from "./../../assets/images/contrax_leaf.png";

const tokens = [
    {
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        name: "Native USDC",
        logo: "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png",
        decimals: 6,
        chainId: CHAIN_ID.ARBITRUM,
    },
    {
        address: "0x42Fd79DAF2a847B59D487650C68c2D7E52D752f6",
        name: "xTrax",
        logo: traxLogo,
        decimals: 18,
        chainId: CHAIN_ID.ARBITRUM,
    },
] as const;

export default tokens;
