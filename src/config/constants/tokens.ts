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
] as const;

export default tokens;
