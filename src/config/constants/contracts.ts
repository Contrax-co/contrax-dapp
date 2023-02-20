export interface Addresses {
    factoryAddress: string;
    wethAddress: string;
    sushiAddress: string;
    dodoTokenAddress: string;
    dodoMineAddress: string;
    usdcAddress: string;
    swapfishMasterChef?: string;
}

const arbitrumAddresses: Addresses = {
    factoryAddress: "0x87e49e9B403C91749dCF89be4ab1d400CBD4068C",
    wethAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    sushiAddress: "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A",
    dodoMineAddress: "0xE3C10989dDc5Df5B1b9c0E6229c2E4e0862fDe3e",
    dodoTokenAddress: "0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581",
    usdcAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    swapfishMasterChef: "0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029",
};
export const addressesByChainId: { [key: number]: Addresses } = {
    0xa4b1: arbitrumAddresses,
};
