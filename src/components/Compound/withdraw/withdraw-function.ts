import * as ethers from 'ethers';
export const wethAddress="0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";


/**
 * Retrieves the user's vault balance
 * @param pool 
 * @param currentWallet 
 * @param setUserVaultBalance 
 */
 export const getUserVaultBalance = async(pool:any, currentWallet:any, setUserVaultBalance:any) => {
    if(currentWallet){

        const {ethereum} = window; 
        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                const vaultContract = new ethers.Contract(pool.vault_addr, pool.vault_abi, signer);

                const balance = await vaultContract.balanceOf(currentWallet);
                const formattedBal = Number(ethers.utils.formatUnits(balance, 18));

                setUserVaultBalance(formattedBal);
            }
            else {
                console.log("Ethereum object doesn't exist!");
            }
        }
        catch (error){
            console.log(error);
        }

    }else{
        setUserVaultBalance(0); 
    }
}


/**
 * Withdraws lp from the vault to user
 * @param pool 
 * @param withdrawAmount 
 * @param setWithdrawAmount 
 * @param setLoading 
 * @param setLoaderMessage 
 */
export const withdraw = async(pool:any, withdrawAmount:any, setWithdrawAmount:any, setLoading:any, setLoaderMessage:any) => {
    const {ethereum} = window;
    setLoading(true);
    setLoaderMessage('User initiated a withdraw from the vault!'); 
    try{
        if(ethereum){
            const provider = new ethers.providers.Web3Provider(ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = provider.getSigner();
            const vaultContract = new ethers.Contract(pool.vault_addr, pool.vault_abi, signer);

            /*
            * Execute the actual withdraw functionality from smart contract
            */
            const formattedBal = ethers.utils.parseUnits(withdrawAmount.toString(), 18);


            const gasEstimated:any = await vaultContract.estimateGas.withdraw(formattedBal);
            const gasMargin = gasEstimated * 1.1;

            const withdrawTxn = await vaultContract.withdraw(formattedBal, {gasLimit: Math.ceil(gasMargin)});
            console.log("Withdrawing...", withdrawTxn.hash);

            setLoaderMessage(`Withdrawing... ${withdrawTxn.hash}`)

            const withdrawTxnStatus = await withdrawTxn.wait(1);
            if (!withdrawTxnStatus.status) {
                setLoaderMessage(`Error withdrawing into vault!`)
            }else{
                setLoaderMessage(`Withdrawn-- ${withdrawTxn.hash}`)
                setWithdrawAmount(0.0);
            }
            
        }else {
            console.log("Ethereum object doesn't exist!");
          }
    }catch (error) {
        console.log(error);
        setLoaderMessage(error + "Try again!")
    }
    finally {
        setLoading(false);
    }
}


/**
 * Withdraws lp from vault into eth
 * @param setLoading 
 * @param setLoaderMessage 
 * @param pool 
 * @param withdrawAmt 
 * @param setWithdrawAmount 
 */
export const zapOut = async(setLoading:any, setLoaderMessage:any, pool:any, withdrawAmt:any, setWithdrawAmount:any) => {
    const {ethereum} = window;
    setLoading(true);
    setLoaderMessage('User initiated a withdraw from the vault!'); 
    try{
        if(ethereum){
            const provider = new ethers.providers.Web3Provider(ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = provider.getSigner();
            const zapperContract = new ethers.Contract(pool.zapper_addr, pool.zapper_abi, signer); 

            
            /*
            * Execute the actual withdraw functionality from smart contract
            */
            const formattedBal = ethers.utils.parseUnits(withdrawAmt.toString(), 18);

            const vaultContract = new ethers.Contract(pool.vault_addr, pool.vault_abi, signer);
            await vaultContract.approve(pool.zapper_addr, formattedBal);

            const lpContract = new ethers.Contract(pool.lp_address, pool.lp_abi, signer);
            await lpContract.approve(pool.zapper_addr, formattedBal);

            const gasEstimated:any = await zapperContract.estimateGas.zapOutAndSwap(pool.vault_addr, formattedBal, wethAddress, 0);
            const gasMargin = gasEstimated * 1.1;

            const withdrawTxn = await zapperContract.zapOutAndSwap(pool.vault_addr, formattedBal, wethAddress, 0, {gasLimit: Math.ceil(gasMargin)});
            console.log("Withdrawing...", withdrawTxn.hash);

            setLoaderMessage(`Withdrawing... ${withdrawTxn.hash}`)

            const withdrawTxnStatus = await withdrawTxn.wait(1);
            if (!withdrawTxnStatus.status) {
                setLoaderMessage(`Error withdrawing into vault!`)
            }else{
                setLoaderMessage(`Withdrawn-- ${withdrawTxn.hash}`) 
                setWithdrawAmount(0.0);
            }
            
        }else {
            console.log("Ethereum object doesn't exist!");
          }
    }catch (error) {
        console.log(error);
        setLoaderMessage(error + "Try again!")
    }
    finally {
        setLoading(false);
    }
}