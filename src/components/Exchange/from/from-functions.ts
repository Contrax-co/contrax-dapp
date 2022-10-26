import * as ethers from 'ethers';

export const totalFrom = async(currentWallet: any, tokenName: any, setFromAmt: any, tokenLp:any, tokenAbi: any) => {
  if (currentWallet) {
    const { ethereum } = window;
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if(tokenName === "ETH"){
          const balance = await provider.getBalance(currentWallet);
          const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
          setFromAmt(formattedBal);
        }
        else if (tokenName !== "ETH"){
          const tokenContract = new ethers.Contract(tokenLp, tokenAbi, signer);
          const balance = await tokenContract.balanceOf(currentWallet);
          const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
          setFromAmt(formattedBal);
        }

      }
      else{
        console.log("Ethereum object doesn't exist!");
      }

    }
    catch(err){
      console.error(err);
    }

  }
  else{
    setFromAmt(0);
  }
}