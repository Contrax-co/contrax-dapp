import * as ethers from 'ethers';

export const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

// export const priceOfTokens = async (address: any, setPrices: any) => {
//   await fetch(
//     `https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${address}&vs_currencies=usd`
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       const prices = JSON.stringify(data);
//       const parse = JSON.parse(prices);

//       const price = parse[`${address}`]['usd'];

//       setPrices(Number(price));
//     });
// };

export const apyPool = async (address: any, setRewardApy: any) => {
  await fetch(
    `https://api.apy.vision/contractInsights/farmSearch/42161/${address}?accessToken=${process.env.REACT_APP_APY_TOKEN}`
  )
    .then((response) => response.json())
    .then((data) => {
      const results: any = JSON.stringify(data.results[0]['apy30d']);

      setRewardApy(Number(results));
    });
};

export const calculateFeeAPY = async (address: any, setFeeAPY: any) => {
  await fetch(
    `https://stats.apy.vision/api/v1/pools/${address}?accessToken=${process.env.REACT_APP_APY_TOKEN}`
  )
    .then((response) => response.json())
    .then((data) => {
      const results: any = JSON.stringify(data[0]['fee_apys_30d']);

      setFeeAPY(Number(results));
    });
};

export const priceToken = async (address: any, setPrice: any) => {
  await fetch(`https://coins.llama.fi/prices/current/arbitrum:${address}`)
    .then((response) => response.json())
    .then((data) => {
      const prices = JSON.stringify(data);

      const parse = JSON.parse(prices);

      const price = parse[`coins`][`arbitrum:${address}`][`price`];
      setPrice(price);
    });
};

export const findTotalAPY = (apy: any, setTotalAPY: any, totalAPY:any, platform:any) => {
  // Compounded APY = (((1 + (0.9*rate/period))^period) - 1) + baseAPY
  let rate; 
  if(platform === "Dodo"){
    rate = apy / 100;
  }else {
    rate = (apy / 100);
  }
  
  const period = 365; //weekly

  const baseAPY = (totalAPY/100) - (apy/100);

  const APY = ((((1 + ((rate) / period)))** period) - 1) + baseAPY;
  setTotalAPY(APY * 100);
}

export const findCompoundAPY = (apy: any, setCompoundAPY: any, totalAPY:any, platform:any) => {
  // Compounded APY = (((1 + (0.9*rate/period))^period) - 1)
  let rate;
  if(platform === "Dodo"){
    rate = apy / 100;
  }else {
    rate = (apy / 100);
  }
  
  const period = 365; //weekly
  
  const baseAPY = (totalAPY/100) - (apy/100);

  const APY = ((((1 + (rate / period)))** period) - 1) + baseAPY;
  const compoundAPY = APY - (totalAPY/100);
  setCompoundAPY(compoundAPY * 100 * 0.9);
};

export const calculateFarmAPY = (
  rewardAPY: any,
  setAPYVisionCompound: any
) => {
  // Compounded APY = (((1 + (0.9*rate/period))^period) - 1)
  const rate = (rewardAPY) / 100;
  const period = 52;

  const APY = ((((1 + ((0.9 * rate) / period))) ** period) - 1);
  setAPYVisionCompound(APY * 100);
};

export const totalFarmAPY = (rewardAPY: any, feeAPY: any, setAPYVisionAPY: any) => {
   // total APY = (((1 + (0.9*rate/period))^period) - 1) + baseAPY
   const rate = (rewardAPY) / 100;
   const baseAPY = (feeAPY) / 100
   const period = 52;
 
   const APY = ((((1 + ((0.9 * rate) / period))) ** period) - 1) + baseAPY;
   setAPYVisionAPY(APY * 100);

}

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
        const formattedBal = Number(ethers.utils.formatUnits(balance, pool.decimals));

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
      const formattedBal = Number(ethers.utils.formatUnits(balance, pool.decimals));

      setTotalVaultBalance(formattedBal);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};
