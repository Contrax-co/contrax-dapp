import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { getNetworkName } from "src/utils/common";
import { Contract, providers, BigNumber } from "ethers";

export const getPrice = async (tokenAddress: string, chainId: number) => {
    try {
        const res = await axios.get(coinsLamaPriceByChainId[chainId] + tokenAddress);
        const prices = JSON.stringify(res.data);
        const parse = JSON.parse(prices);

        const price = parse[`coins`][`${getNetworkName(chainId)}:${tokenAddress}`][`price`] as number;
        return price;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

export const getBalance = async (
    tokenAddress: string,
    address: string,
    provider: providers.Provider
): Promise<BigNumber> => {
    try {
        const contract = new Contract(tokenAddress, ["function balanceOf(address) view returns (uint)"], provider);
        const balance = await contract.balanceOf(address);
        return balance;
    } catch (error) {
        console.error(error);
        return BigNumber.from(0);
    }
};
