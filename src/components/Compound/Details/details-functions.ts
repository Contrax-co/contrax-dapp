import * as ethers from 'ethers';

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

export const userTokenAmount = async (
  currentWallet: any,
  address: any,
  address_abi: any,
  setAmount: any
) => {
  const { ethereum } = window;
  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const tokenContract = new ethers.Contract(address, address_abi, signer);

      const balance = await tokenContract.balanceOf(currentWallet);
      const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
      setAmount(formattedBal);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (err) {
    console.log(err);
  }
};

export const userVaultAmount = async (
  currentWallet: any,
  vault: any,
  vault_abi: any,
  setAmount: any
) => {
  if (currentWallet) {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();

        const vaultContract = new ethers.Contract(vault, vault_abi, signer);

        const balance = await vaultContract.balanceOf(currentWallet);
        const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
        setAmount(formattedBal);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log('Connect Wallet!');
  }
};
