export interface Addresses {
    factoryAddress: string;
    wethAddress: string;
    sushiAddress: string;
    dodoTokenAddress: string;
    dodoMineAddress: string;
    usdcAddress: string;
    usdtAddress: string;
    swapfishMasterChef?: string;
    nativeUsdAddress?: string;
    arbitrumAddress?: string;
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
};

const polygonAddresses: Addresses = {
    factoryAddress: "",
    wethAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    sushiAddress: "",
    dodoMineAddress: "",
    dodoTokenAddress: "",
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    usdtAddress: "",
    swapfishMasterChef: "",
};

export const addressesByChainId: { [key: number]: Addresses } = {
    0xa4b1: arbitrumAddresses,
    137: polygonAddresses,
};
