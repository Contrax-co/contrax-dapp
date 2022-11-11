import * as ethers from 'ethers';

export const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

export const priceOfTokens = async (address: any, setPrices: any) => {
  await fetch(
    `https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${address}&vs_currencies=usd`
  )
    .then((response) => response.json())
    .then((data) => {
      const prices = JSON.stringify(data);
      const parse = JSON.parse(prices);

      const price = parse[`${address}`]['usd'];

      setPrices(Number(price));
    });
};

/**
 * Retrieves the user's vault balance
 * @param pool
 * @param currentWallet
 * @param setUserVaultBalance
 */
export const getUserVaultBalance = async (
  pool: any,
  currentWallet: any,
  setUserVaultBalance: any
) => {
  if (currentWallet) {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const vaultContract = new ethers.Contract(
          pool.vault_addr,
          pool.vault_abi,
          signer
        );

        const balance = await vaultContract.balanceOf(currentWallet);
        const formattedBal = Number(ethers.utils.formatUnits(balance, 18));

        setUserVaultBalance(formattedBal);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    setUserVaultBalance(0);
  }
};

export const getTotalVaultBalance = async (
  pool: any,
  setTotalVaultBalance: any
) => {
  const { ethereum } = window;
  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const vaultContract = new ethers.Contract(
        pool.vault_addr,
        pool.vault_abi,
        signer
      );

      const balance = await vaultContract.totalSupply();
      const formattedBal = Number(ethers.utils.formatUnits(balance, 18));

      setTotalVaultBalance(formattedBal);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

export const totalLPTokenExisting = async (
  pool: any,
  price0: any,
  price1: any,
  setPriceOfToken: any
) => {
  const { ethereum } = window;
  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const lpContract = new ethers.Contract(
        pool.lp_address,
        pool.lp_abi,
        signer
      );

      const _totalSupply = await lpContract.totalSupply();
      const totalSupply = parseFloat(ethers.utils.formatEther(_totalSupply));

      const [_reserve0, _reserve1] = await lpContract.getReserves();

      const reserve0 = parseFloat(ethers.utils.formatEther(_reserve0));
      const reserve1 = parseFloat(ethers.utils.formatEther(_reserve1));

      const value0 = reserve0 * price0;
      const value1 = reserve1 * price1;

      const singleValue = (value0 + value1) / totalSupply;
      setPriceOfToken(singleValue);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

export const usdTokenValueInVault = async (
  priceOfToken: any,
  totalVaultBalance: any,
  setValueInVault: any
) => {
  const valueInVault = priceOfToken * totalVaultBalance;
  setValueInVault(valueInVault);
};

export const usdUserVaultValue = async (
  priceOfToken: any,
  userVaultBalance: any,
  setUserUsdValue: any
) => {
  const userValue = priceOfToken * userVaultBalance;
  setUserUsdValue(userValue);
};
