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
] as const;

export default tokens;
