import * as ethers from 'ethers';

export const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

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

/**
 * Gets the balance of the native eth that the user has
 * @param currentWallet
 * @param setEthUserBal
 * @param ethUserBal
 */
export const getEthBalance = async (currentWallet: any, setEthUserBal: any) => {
  if (currentWallet) {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);

        const balance = await provider.getBalance(currentWallet);
        const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
        setEthUserBal(formattedBal);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    setEthUserBal(0);
  }
};

/**
 * Gets the balance of the lp tokens that the user has
 * @param pool
 * @param currentWallet
 * @param setUserLPBalance
 * @param userLPBalance
 */
export const getLPBalance = async (
  pool: any,
  currentWallet: any,
  setUserLPBalance: any
) => {
  if (currentWallet) {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);

        const lpContract = new ethers.Contract(
          pool.lp_address,
          pool.lp_abi,
          provider
        );

        const balance = await lpContract.balanceOf(currentWallet);
        const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
        setUserLPBalance(formattedBal);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    setUserLPBalance(0);
  }
};

/**
 * Zaps ETH into the Vault
 * @param {*} setLoading
 * @param {*} pool
 * @param {*} ethZapAmount
 * @param {*} wethAddress
 * @param {*} setEthZapAmount
 */
export const zapIn = async (
  setEthUserBal: any,
  currentWallet: any,
  setLoading: any,
  pool: any,
  ethZapAmount: any,
  setEthZapAmount: any,
  setLoaderMessage: any,
  setSuccess:any,
  setSecondaryMessage: any,
  setLink:any,
  setHash:any
) => {
  const { ethereum } = window;
  setSuccess('loading');
  setLoading(true);
  setLoaderMessage('Zap initiated!');
  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const zapperContract = new ethers.Contract(
        pool.zapper_addr,
        pool.zapper_abi,
        signer
      );

      /*
       * Execute the actual deposit functionality from smart contract
       */
      const formattedBal = ethers.utils.parseUnits(ethZapAmount.toString(), 18);

      const gasPrice:any = await provider.getGasPrice();

      setSecondaryMessage('Approving zapping...');
      
      let zapperTxn;
      try {
        const gasEstimated:any = await zapperContract.estimateGas.zapInETH(pool.vault_addr,0,wethAddress, {value: formattedBal});
        const gasMargin = gasEstimated * 1.1;
  
        zapperTxn = await zapperContract.zapInETH(pool.vault_addr,0, wethAddress, {value: formattedBal, gasLimit: Math.ceil(gasMargin)});

      }catch{
        zapperTxn = await zapperContract.zapInETH(pool.vault_addr, 0, wethAddress,
          { value: formattedBal, gasLimit: gasPrice/20 }
        );
      }

      setLoaderMessage(`Zapping...`);
      setSecondaryMessage(`Txn hash: ${zapperTxn.hash}`);

      const zapperTxnStatus = await zapperTxn.wait(1);
      if (!zapperTxnStatus.status) {
        setLink(true);
        setHash(zapperTxn.hash); 
        setLoaderMessage(`Error zapping into vault!`);
        setSecondaryMessage(`Try again!`);
        setSuccess('fail');
      } else {

        setLink(true);
        setHash(zapperTxn.hash); 
        setLoaderMessage(`Deposited--`);
        setSuccess('success');
        setSecondaryMessage(`Txn hash: ${zapperTxn.hash}`);
        setEthZapAmount(0.0);
        getEthBalance(currentWallet, setEthUserBal);
      }
    } else {
      console.log("Ethereum object doesn't exist!");

      setLoaderMessage(`Error depositing!`);
      setSecondaryMessage(`Try again!`);
      setSuccess('fail');
    }
  } catch (error) {
    console.log(error);
    setLoaderMessage(`Error depositing!`);
    setSecondaryMessage(`Try again!`);
    setSuccess('fail');
  }
};

/**
 * Deposits LP token into the vault
 * @param {*} pool
 * @param {*} depositAmount
 * @param {*} setLPDepositAmount
 * @param {*} setLoading
 */
export const deposit = async (
  setLPUserBal: any,
  currentWallet: any,
  pool: any,
  depositAmount: any,
  setLPDepositAmount: any,
  setLoading: any,
  setLoaderMessage: any,
  setSuccess: any,
  setSecondaryMessage: any,
  setLink: any,
  setHash:any
) => {
  const { ethereum } = window;
  setSuccess('loading');
  setLoading(true);
  setLoaderMessage('Deposit initiated!');
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

      const gasPrice1: any = await provider.getGasPrice();

      setSecondaryMessage('Approving deposit...');

      /*
       * Execute the actual deposit functionality from smart contract
       */
      const formattedBal = ethers.utils.parseUnits(
        Number(depositAmount).toFixed(16),
        18
      );

      // approve the vault to spend asset
      const lpContract = new ethers.Contract(
        pool.lp_address,
        pool.lp_abi,
        signer
      );
      await lpContract.approve(pool.vault_addr, formattedBal);

      setSecondaryMessage('Confirm deposit...');

      let depositTxn; 

      try {
        const gasEstimated:any = await vaultContract.estimateGas.deposit(formattedBal);
        const gasMargin = gasEstimated * 1.1;
  
        depositTxn = await vaultContract.deposit(formattedBal, {gasLimit: Math.ceil(gasMargin)});

      }catch {
        //the abi of the vault contract needs to be checked
        depositTxn = await vaultContract.deposit(formattedBal, {gasLimit: gasPrice1/20});
      }

      setLoaderMessage(`Depositing...`);
      setSecondaryMessage(`Txn hash: ${depositTxn.hash}`);

      const depositTxnStatus = await depositTxn.wait(1);
      if (!depositTxnStatus.status) {
        setLink(true);
        setHash(depositTxn.hash); 
        setLoaderMessage(`Error depositing into vault!`);
        setSecondaryMessage(`Try again!`);
        setSuccess('fail');
      } else {
        setLink(true);
        setHash(depositTxn.hash); 
        setLoaderMessage(`Deposited--`);
        setSuccess('success');
        setSecondaryMessage(`Txn hash: ${depositTxn.hash}`);
        setLPDepositAmount(0.0);
        getLPBalance(pool, currentWallet, setLPUserBal);
      }
    } else {
      console.log("Ethereum object doesn't exist!");

      setLoaderMessage(`Error depositing!`);
      setSecondaryMessage(`Try again!`);
      setSuccess('fail');
    }
  } catch (error) {
    console.log(error);
    setLoaderMessage(`Error depositing!`);
    setSecondaryMessage(`Try again!`);
    setSuccess('fail');
  }
};

/**
 * Deposits LP token into the vault
 * @param {*} pool
 * @param {*} depositAmount
 * @param {*} setLPDepositAmount
 * @param {*} setLoading
 */
export const depositAll = async (
  setLPUserBal: any,
  currentWallet: any,
  pool: any,
  depositAmount: any,
  setLPDepositAmount: any,
  setLoading: any,
  setLoaderMessage: any,
  setSuccess: any,
  setSecondaryMessage: any,
  setLink:any,
  setHash:any
) => {
  const { ethereum } = window;
  setSuccess('loading');
  setLoading(true);
  setLoaderMessage('Deposit initiated!');
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

      const gasPrice1: any = await provider.getGasPrice();

      setSecondaryMessage('Approving deposit...');

      /*
       * Execute the actual deposit functionality from smart contract
       */
      const formattedBal = ethers.utils.parseUnits(
        Number(Number(depositAmount) + Number(depositAmount)).toFixed(16),
        18
      );

      // approve the vault to spend asset
      const lpContract = new ethers.Contract(
        pool.lp_address,
        pool.lp_abi,
        signer
      );
      await lpContract.approve(pool.vault_addr, formattedBal);

      setSecondaryMessage('Confirm deposit...');
      
      let depositTxn;
      try {
        const gasEstimated:any = await vaultContract.estimateGas.depositAll();
        const gasMargin = gasEstimated * 1.1;
  
        depositTxn = await vaultContract.depositAll({gasLimit: Math.ceil(gasMargin)});
      }catch {
        //the abi of the vault contract needs to be checked
        depositTxn = await vaultContract.depositAll({
          gasLimit: gasPrice1 / 20,
        });

      }

      setLoaderMessage(`Depositing...`);
      setSecondaryMessage(`Txn hash: ${depositTxn.hash}`);

      const depositTxnStatus = await depositTxn.wait(1);
      if (!depositTxnStatus.status) {
        setLink(true);
        setHash(depositTxn.hash); 
        setLoaderMessage(`Error depositing into vault!`);
        setSecondaryMessage(`Try again!`);
        setSuccess('fail');
      } else {
        setLink(true);
        setHash(depositTxn.hash); 
        setLoaderMessage(`Deposited--`);
        setSuccess('success');
        setSecondaryMessage(`Txn hash: ${depositTxn.hash}`);
        setLPDepositAmount(0.0);
        getLPBalance(pool, currentWallet, setLPUserBal);
      }
    } else {
      console.log("Ethereum object doesn't exist!");

      setLoaderMessage(`Error depositing!`);
      setSecondaryMessage(`Try again!`);
      setSuccess('fail');
    }
  } catch (error) {
    console.log(error);
    setLoaderMessage(`Error depositing!`);
    setSecondaryMessage(`Try again!`);
    setSuccess('fail');
  }
};

/**
 * Zaps ETH into the Vault
 * @param {*} setLoading
 * @param {*} pool
 * @param {*} ethZapAmount
 * @param {*} wethAddress
 * @param {*} setEthZapAmount
 */
 export const zapInAll = async (
  setEthUserBal: any,
  currentWallet: any,
  setLoading: any,
  pool: any,
  ethZapAmount: any,
  setEthZapAmount: any,
  setLoaderMessage: any,
  setSuccess:any,
  setSecondaryMessage: any,
  setLink:any,
  setHash:any
) => {
  const { ethereum } = window;
  setSuccess('loading');
  setLoading(true);
  setLoaderMessage('Zap initiated!');
  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const zapperContract = new ethers.Contract(
        pool.zapper_addr,
        pool.zapper_abi,
        signer
      );

      /*
       * Execute the actual deposit functionality from smart contract
       */
      const gasPrice:any = await provider.getGasPrice();
      const gasToRemove = Number(ethers.utils.formatUnits(gasPrice, 9));
   
      const formattedBal = ethers.utils.parseUnits((ethZapAmount - gasToRemove/20).toString(), 18);

      setSecondaryMessage('Approving zapping...');
      
      let zapperTxn;
      try {
        const gasEstimated:any = await zapperContract.estimateGas.zapInETH(pool.vault_addr,0,wethAddress, {value: formattedBal});
        const gasMargin = gasEstimated * 1.1;
  
        zapperTxn = await zapperContract.zapInETH(pool.vault_addr,0, wethAddress, {value: formattedBal, gasLimit: Math.ceil(gasMargin)});

      }catch{
        zapperTxn = await zapperContract.zapInETH(pool.vault_addr, 0, wethAddress,
          { value: formattedBal, gasLimit: gasPrice/20 }
        );
      }

      setLoaderMessage(`Zapping...`);
      setSecondaryMessage(`Txn hash: ${zapperTxn.hash}`);

      const zapperTxnStatus = await zapperTxn.wait(1);
      if (!zapperTxnStatus.status) {
        setLink(true);
        setHash(zapperTxn.hash); 
        setLoaderMessage(`Error zapping into vault!`);
        setSecondaryMessage(`Try again!`);
        setSuccess('fail');
      } else {
        setLink(true);
        setHash(zapperTxn.hash); 
        setLoaderMessage(`Deposited--`);
        setSuccess('success');
        setSecondaryMessage(`Txn hash: ${zapperTxn.hash}`);
        setEthZapAmount(0.0);
        getEthBalance(currentWallet, setEthUserBal);
      }
    } else {
      console.log("Ethereum object doesn't exist!");

      setLoaderMessage(`Error depositing!`);
      setSecondaryMessage(`Try again!`);
      setSuccess('fail');
    }
  } catch (error) {
    console.log(error);
    setLoaderMessage(`Error depositing!`);
    setSecondaryMessage(`Try again!`);
    setSuccess('fail');
  }
};
