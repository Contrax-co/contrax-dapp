import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { getNetworkName, toEth } from "src/utils/common";
import { Contract, providers, BigNumber, Signer, constants } from "ethers";
import { erc20ABI } from "wagmi";

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

export const getLpPrice = async (lpAddress: string, provider: providers.Provider, chainId: number) => {
    try {
        let price = await getPrice(lpAddress, chainId);
        if (price !== 0) return price;
        const lpContract = new Contract(
            lpAddress,
            [
                "function token0() view returns (address)",
                "function token1() view returns (address)",
                "function totalSupply() view returns (uint256)",
                "function getReserves() view returns (uint112,uint112,uint32)",
            ],
            provider
        );
        const token0 = await lpContract.token0();
        const totalSupply = await lpContract.totalSupply();
        const reserves = await lpContract.getReserves();
        price = await getPrice(token0, chainId);
        if (price !== 0) {
            price =
                Number(
                    reserves[0]
                        .mul(2)
                        .mul(price * 1000)
                        .mul(1000)
                        .div(totalSupply)
                ) / 1000000;
        } else {
            const token1 = await lpContract.token1();

            price = await getPrice(token1, chainId);
            price =
                Number(
                    reserves[1]
                        .mul(2)
                        .mul(price * 1000)
                        .mul(1000)
                        .div(totalSupply)
                ) / 1000000;
        }

        return price;
    } catch (error) {
        console.error(error);
        return 0;
    }
};
