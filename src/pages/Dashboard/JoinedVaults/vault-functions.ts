import * as ethers from "ethers";

export const priceOfToken = async (address: any, setPrice: any) => {
    await fetch(`https://coins.llama.fi/prices/current/arbitrum:${address}`)
        .then((response) => response.json())
        .then((data) => {
            const prices = JSON.stringify(data);

            const parse = JSON.parse(prices);

            const price = parse[`coins`][`arbitrum:${address}`][`price`];
            setPrice(price);
        });
};

export const totalArbitrumUsd = async (currentWallet: any, setTotalUsd: any) => {
    await fetch(
        `https://api.apy.vision/portfolio/42161/core/${currentWallet}?accessToken=${process.env.REACT_APP_APY_TOKEN}`
    )
        .then((response) => response.json())
        .then((data) => {
            const total = JSON.stringify(data);

            const totalValue = JSON.parse(total);

            const totalValueUsd = totalValue[`totalValueUsd`];

            setTotalUsd(totalValueUsd?.toFixed(2));
        });
};

export const totalVault = async (vaultAddress: any, vault_abi: any, setVaultAmount: any, decimals: any) => {
    const { ethereum } = window;
    try {
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();

            const vaultContract = new ethers.Contract(vaultAddress, vault_abi, signer);
            const balance = await vaultContract.totalSupply();
            const formattedBal = Number(ethers.utils.formatUnits(balance, decimals));

            setVaultAmount(formattedBal);
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    } catch (err) {
        console.log(err);
    }
};

export const userVaultTokens = async (
    currentWallet: any,
    vaultAddress: any,
    vault_abi: any,
    setAmount: any,
    decimals: any
) => {
    if (currentWallet) {
        const { ethereum } = window;
        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();

                const vaultContract = new ethers.Contract(vaultAddress, vault_abi, signer);
                const balance = await vaultContract.balanceOf(currentWallet);
                const formattedBal = Number(ethers.utils.formatUnits(balance, decimals));

                setAmount(formattedBal);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log("Connect Wallet!");
    }
};
