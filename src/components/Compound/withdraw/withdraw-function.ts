import * as ethers from 'ethers';
export const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

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

/**
 * Withdraws lp from the vault to user
 * @param pool
 * @param withdrawAmount
 * @param setWithdrawAmount
 * @param setLoading
 * @param setLoaderMessage
 */
export const withdraw = async (
  setUserVaultBalance: any,
  currentWallet: any,
  setSuccess: any,
  setSecondaryMessage: any,
  pool: any,
  withdrawAmount: any,
  setWithdrawAmount: any,
  setLoading: any,
  setLoaderMessage: any,
  setLink:any,
  setHash:any
) => {
  const { ethereum } = window;
  setSuccess('loading');
  setLoading(true);
  setLoaderMessage('Withdraw initiated!');
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

      setSecondaryMessage('Approving withdraw...');

      /*
       * Execute the actual withdraw functionality from smart contract
       */
      const formattedBal = ethers.utils.parseUnits(
        Number(withdrawAmount).toFixed(16),
        18
      );

      setSecondaryMessage('Confirm withdraw...');

      const withdrawTxn = await vaultContract.withdraw(formattedBal, {
        gasLimit: gasPrice1 / 10,
      });

      setLoaderMessage(`Withdrawing... `);
      setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);

      const withdrawTxnStatus = await withdrawTxn.wait(1);
      if (!withdrawTxnStatus.status) {
        setLink(true);
        setHash(withdrawTxn.hash); 
        setLoaderMessage(`Error withdrawing from vault!`);
        setSecondaryMessage(`Try again!`);
        setSuccess('fail');
      } else {
        setLink(true);
        setHash(withdrawTxn.hash); 
        setSuccess('success');
        setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);
        setLoaderMessage(`Withdrawn--`);
        setWithdrawAmount(0.0);
        getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
      }
    } else {
      console.log("Ethereum object doesn't exist!");

      setLoaderMessage(`Error withdrawing!`);
      setSecondaryMessage(`Try again!`);
      setSuccess('fail');
    }
  } catch (error) {
    console.log(error);
    setLoaderMessage(`Error withdrawing!`);
    setSecondaryMessage(`Try again!`);
    setSuccess('fail');
  }
};

/**
 * Withdraws lp from vault into eth
 * @param setLoading
 * @param setLoaderMessage
 * @param pool
 * @param withdrawAmt
 * @param setWithdrawAmount
 */
export const zapOut = async (
  setLoading: any,
  setLoaderMessage: any,
  pool: any,
  withdrawAmt: any,
  setWithdrawAmount: any,
  setLink:any,
  setHash:any
) => {
  const { ethereum } = window;
  setLoading(true);
  setLoaderMessage('User initiated a withdraw from the vault!');
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
       * Execute the actual withdraw functionality from smart contract
       */
      const formattedBal = ethers.utils.parseUnits(
        Number(withdrawAmt).toFixed(16),
        18
      );

      const vaultContract = new ethers.Contract(
        pool.vault_addr,
        pool.vault_abi,
        signer
      );
      await vaultContract.approve(pool.zapper_addr, formattedBal);

      const lpContract = new ethers.Contract(
        pool.lp_address,
        pool.lp_abi,
        signer
      );
      await lpContract.approve(pool.zapper_addr, formattedBal);

      const gasPrice = await provider.getGasPrice();

      const withdrawTxn = await zapperContract.zapOutAndSwap(
        pool.vault_addr,
        formattedBal,
        wethAddress,
        0,
        { gasLimit: gasPrice }
      );
      console.log('Withdrawing...', withdrawTxn.hash);

      setLoaderMessage(`Withdrawing... ${withdrawTxn.hash}`);

      const withdrawTxnStatus = await withdrawTxn.wait(1);
      if (!withdrawTxnStatus.status) {
        setLoaderMessage(`Error withdrawing into vault!`);
      } else {
        setLoaderMessage(`Withdrawn-- ${withdrawTxn.hash}`);
        setWithdrawAmount(0.0);
      }
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
    setLoaderMessage(error + 'Try again!');
  } finally {
    setLoading(false);
  }
};

/**
 * Withdraws lp from the vault to user
 * @param pool
 * @param withdrawAmount
 * @param setWithdrawAmount
 * @param setLoading
 * @param setLoaderMessage
 */
export const withdrawAll = async (
  setUserVaultBalance: any,
  currentWallet: any,
  setSuccess: any,
  setSecondaryMessage: any,
  pool: any,
  setWithdrawAmount: any,
  setLoading: any,
  setLoaderMessage: any,
  setLink:any,
  setHash:any
) => {
  const { ethereum } = window;
  setSuccess('loading');
  setLoading(true);
  setLoaderMessage('Withdraw initiated!');
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

      setSecondaryMessage('Approving withdraw...');

      /*
       * Execute the actual withdraw functionality from smart contract
       */
      setSecondaryMessage('Confirm withdraw...');

      const withdrawTxn = await vaultContract.withdrawAll({
        gasLimit: gasPrice1 / 10,
      });

      setLoaderMessage(`Withdrawing... `);
      setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);

      const withdrawTxnStatus = await withdrawTxn.wait(1);
      if (!withdrawTxnStatus.status) {
        setLink(true);
        setHash(withdrawTxn.hash); 
        setLoaderMessage(`Error withdrawing from vault!`);
        setSecondaryMessage(`Try again!`);
        setSuccess('fail');
      } else {
        setLink(true);
        setHash(withdrawTxn.hash); 
        setSuccess('success');
        setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);
        setLoaderMessage(`Withdrawn--`);
        setWithdrawAmount(0.0);
        getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
      }
    } else {
      console.log("Ethereum object doesn't exist!");

      setLoaderMessage(`Error withdrawing!`);
      setSecondaryMessage(`Try again!`);
      setSuccess('fail');
    }
  } catch (error) {
    console.log(error);
    setLoaderMessage(`Error withdrawing!`);
    setSecondaryMessage(`Try again!`);
    setSuccess('fail');
  }
};
