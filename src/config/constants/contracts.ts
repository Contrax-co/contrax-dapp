interface Addresses {
    factoryAddress: string;
}

const arbitrumAddresses: Addresses = {
    factoryAddress: "0x87e49e9B403C91749dCF89be4ab1d400CBD4068C",
};
export const addressesByChainId: { [key: number]: Addresses } = {
    0xa4b1: arbitrumAddresses,
};
