import { CHAIN_ID } from "src/types/enums";
import { Address } from "viem";

export interface Addresses {
    arbitrumAddress?: string;
    factoryAddress: Address;
    wethAddress: Address;
    sushiAddress: Address;
    dodoTokenAddress: Address;
    dodoMineAddress: Address;
    usdcAddress: Address;
    usdtAddress: Address;
    swapfishMasterChef?: Address;
    bridgedUsdAddress?: Address;
    paymasterAddress?: Address;
    universalPaymaster?: Address;
    nativeUsdAddress?: Address;
}

const arbitrumAddresses: Addresses = {
    factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    wethAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    sushiAddress: "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A",
    dodoMineAddress: "0xE3C10989dDc5Df5B1b9c0E6229c2E4e0862fDe3e",
    dodoTokenAddress: "0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581",
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    usdtAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    swapfishMasterChef: "0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029",
    nativeUsdAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    arbitrumAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    bridgedUsdAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    paymasterAddress: "0x75688705486405550239134Aa01e80E739f3b459",
    universalPaymaster: "0xDACDA34b8b3d9dF839F14e87699e594329FD0a83",
};

const baseAddresses: Addresses = {
    bridgedUsdAddress: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    factoryAddress: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
    wethAddress: "0x4200000000000000000000000000000000000006",
    nativeUsdAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    arbitrumAddress: "",
    sushiAddress: "" as Address,
    dodoMineAddress: "" as Address,
    dodoTokenAddress: "" as Address,
    swapfishMasterChef: "" as Address,
    usdtAddress: "" as Address,
};

const coreAddresses: Addresses = {
    bridgedUsdAddress: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9",
    factoryAddress: "" as Address,
    wethAddress: "0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f",
    nativeUsdAddress: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9",
    usdcAddress: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9",
    arbitrumAddress: "",
    sushiAddress: "" as Address,
    dodoMineAddress: "" as Address,
    dodoTokenAddress: "" as Address,
    swapfishMasterChef: "" as Address,
    usdtAddress: "" as Address,
};

const polygonAddresses: Addresses = {
    factoryAddress: "" as Address,
    wethAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    sushiAddress: "" as Address,
    dodoMineAddress: "" as Address,
    dodoTokenAddress: "" as Address,
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    usdtAddress: "" as Address,
    swapfishMasterChef: "" as Address,
};

export const addressesByChainId: { [key: number]: Addresses } = {
    0xa4b1: arbitrumAddresses,
    137: polygonAddresses,
    [CHAIN_ID.BASE]: baseAddresses,
    [CHAIN_ID.CORE]: coreAddresses,
};
