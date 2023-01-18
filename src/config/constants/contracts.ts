export interface Addresses {
    factoryAddress: string;
    wethAddress: string;
}

const arbitrumAddresses: Addresses = {
    factoryAddress: "0x87e49e9B403C91749dCF89be4ab1d400CBD4068C",
    wethAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};
export const addressesByChainId: { [key: number]: Addresses } = {
    0xa4b1: arbitrumAddresses,
};
