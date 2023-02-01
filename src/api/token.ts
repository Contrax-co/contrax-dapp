import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { getNetworkName } from "src/utils/common";

export const getPrice = async (tokenAddress: string, chainId: number) => {
    const res = await axios.get(coinsLamaPriceByChainId[chainId] + tokenAddress);
    const prices = JSON.stringify(res.data);
    const parse = JSON.parse(prices);

    const price = parse[`coins`][`${getNetworkName(chainId)}:${tokenAddress}`][`price`] as number;
    return price;
};
