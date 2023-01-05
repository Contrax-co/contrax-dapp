import { Network, Alchemy } from "alchemy-sdk";

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_KEY,
    network: Network.ARB_MAINNET,
};

const alchemy = new Alchemy(settings);

export const getGasPrice = async (setGasPrice: any) => {
    const gas = await alchemy.core.getGasPrice();
    setGasPrice(gas["_hex"]);
};

export const main = async (currentWallet: any, setTokens: any) => {
    const balances = await alchemy.core.getTokenBalances(currentWallet);

    // Remove tokens with zero balance
    const nonZeroBalances = balances.tokenBalances.filter((token: any) => {
        return parseInt(token.tokenBalance, 16) >= 100000000000000;
    });

    setTokens(nonZeroBalances);
};

export const priceOfToken = async (address: any, setPrice: any) => {
    try {
        await fetch(`https://coins.llama.fi/prices/current/arbitrum:${address}`)
            .then((response) => response.json())
            .then((data) => {
                const prices = JSON.stringify(data);

                const parse = JSON.parse(prices);

                const price = parse[`coins`][`arbitrum:${address}`][`price`];
                setPrice(price);
            });
    } catch (err) {}
};

export const tokenInfo = async (token: any, setBalance: any, setName: any, setSymbol: any) => {
    // Get balance of token
    let balance: any = token.tokenBalance;

    // Get metadata of token
    const metadata: any = await alchemy.core.getTokenMetadata(token.contractAddress);

    // Compute token balance in human-readable format
    balance = balance / Math.pow(10, metadata.decimals);
    balance = balance.toFixed(4);

    setBalance(balance);
    setName(metadata.name);
    setSymbol(metadata.symbol);
};
