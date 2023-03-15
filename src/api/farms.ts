import axios from "axios";

export const getEarnings = async (tokenAddress: string, chainId: number) => {
    try {
        const res = await axios.get(coinsLamaPriceByChainId[chainId] + tokenAddress, {
            cache: true,
        });

        const prices = JSON.stringify(res.data);
        const parse = JSON.parse(prices);

        const token = parse[`coins`][`${getNetworkName(chainId)}:${tokenAddress}`];
        const price = token ? (token[`price`] as number) : 0;
        return price;
    } catch (error) {
        console.error(error);
        return 0;
    }
};
