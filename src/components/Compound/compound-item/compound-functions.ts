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