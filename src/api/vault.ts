import axios from "axios";
import { APY_TOKEN, APY_VISION_URL, COINS_LLAMA_PRICE, NETWORK_NAME } from "src/config/constants";
import * as ethers from "ethers";

export const priceOfToken = async (address: any) => {
    const res = await axios.get(`${COINS_LLAMA_PRICE}${address}`);
    const prices = JSON.stringify(res.data);
    const parse = JSON.parse(prices);
    const price = parse[`coins`][`${NETWORK_NAME}:${address}`][`price`];
    return price as string;
};

export const totalArbitrumUsd = async (currentWallet: any) => {
    const res = await axios.get(`${APY_VISION_URL}/portfolio/42161/core/${currentWallet}?accessToken=${APY_TOKEN}`);

    const total = JSON.stringify(res.data);

    const totalValue = JSON.parse(total);

    const totalValueUsd = totalValue[`totalValueUsd`].toFixed(2);
    return totalValueUsd as string;
};

export const totalVaultAmount = async (vaultAddress: any, vault_abi: any, decimals: any) => {
    const { ethereum } = window;
    if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const vaultContract = new ethers.Contract(vaultAddress, vault_abi, signer);
        const balance = await vaultContract.totalSupply();
        const formattedBal = Number(ethers.utils.formatUnits(balance, decimals));
        return formattedBal;
    } else {
        throw new Error("Ethereum object doesn't exist!");
    }
};

export const userVaultTokens = async (currentWallet: any, vaultAddress: any, vault_abi: any, decimals: any) => {
    const { ethereum } = window;

    if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const vaultContract = new ethers.Contract(vaultAddress, vault_abi, signer);
        const balance = await vaultContract.balanceOf(currentWallet);
        const formattedBal = Number(ethers.utils.formatUnits(balance, decimals));

        return formattedBal;
    } else {
        throw new Error("Ethereum object doesn't exist!");
    }
};
