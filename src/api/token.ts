import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { getNetworkName } from "src/utils/common";
import { Contract, providers, BigNumber, Signer, constants } from "ethers";
import { erc20ABI } from "wagmi";

export const getPrice = async (tokenAddress: string, chainId: number) => {
    try {
        const res = await axios.get(coinsLamaPriceByChainId[chainId] + tokenAddress);
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

export const getBalance = async (
    tokenAddress: string,
    address: string,
    provider: providers.Provider | Signer
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

export const approveErc20 = async (
    contractAddress: string,
    spender: string,
    amount: BigNumber,
    currentWallet: string,
    signer: Signer
) => {
    const contract = new Contract(contractAddress, erc20ABI, signer);
    // check allowance
    const allowance = await contract.allowance(currentWallet, spender);
    // if allowance is lower than amount, approve
    if (amount.gt(allowance)) {
        // approve
        await (await contract.approve(spender, constants.MaxUint256)).wait();
    }
};
