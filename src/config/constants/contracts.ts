export interface Addresses {
    factoryAddress: string;
    wethAddress: string;
    sushiAddress: string;
}

const arbitrumAddresses: Addresses = {
    factoryAddress: "0x87e49e9B403C91749dCF89be4ab1d400CBD4068C",
    wethAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    sushiAddress: "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A",
};
export const addressesByChainId: { [key: number]: Addresses } = {
    0xa4b1: arbitrumAddresses,
};
