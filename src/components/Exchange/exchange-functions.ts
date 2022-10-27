import * as ethers from 'ethers';

const exchange_address = "0xdD035b13ef190244c514f68E8F7b16555aFc89Fd";
const exchange_abi = [{"inputs":[{"internalType":"address","name":"_controller","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"controller","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushiRouter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapFromTokenToToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapPairForPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapPairForToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapTokenForPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"weth","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];


export const swapFromTokenToToken = async (
  currentWallet:any, fromValue: any, 
  from:any, to:any, setValue:any, 
  token_abi: any
) => {
  if (currentWallet) {
    const { ethereum } = window;
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const exchangeContract = new ethers.Contract(exchange_address, exchange_abi, signer);

        const tokenContract = new ethers.Contract(from, token_abi,signer); 

        /*
        * Execute the actual swap functionality from smart contract
        */
        const formattedBal = ethers.utils.parseUnits(fromValue.toString(), 18);
        await tokenContract.approve(exchange_address, formattedBal); 
       
        const gasPrice = await provider.getGasPrice();
        const exchangeTxn = await exchangeContract.swapFromTokenToToken(from, to, formattedBal, {gasLimit: gasPrice});

          // const gasEstimated: any = await exchangeContract.estimateGas.swapFromTokenToToken(from, to, formattedBal);

          // const gasMargin = gasEstimated * 1.1;
          // exchangeTxn = await exchangeContract.swapFromTokenToToken(from, to, formattedBal, {
          //   gasLimit: Math.ceil(gasMargin),
          // });

       

        console.log(`Swapping... ${exchangeTxn.hash}`);

        const exchangeTxnStatus = await exchangeTxn.wait(1);
        if (!exchangeTxnStatus.status) {
          console.log(`Error swapping!`);
        } else {
          console.log(`Swapped-- ${exchangeTxn.hash}`);
          setValue(0.0);
        }
  
      }
      else{
        console.log("Ethereum object doesn't exist!");
      }

    }
    catch(error){
      console.log(error);
    }

  }
  else{

  }
}

export const swapFromTokenToPair = async (
  currentWallet:any, from:any, to:any, 
  token_abi: any, fromValue:any, setValue:any
) => {
  if (currentWallet) {
    const { ethereum } = window;
    try{
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const exchangeContract = new ethers.Contract(exchange_address, exchange_abi, signer);

        const tokenContract = new ethers.Contract(from, token_abi, signer); 

         /*
        * Execute the actual swap functionality from smart contract
        */
        const formattedBal = ethers.utils.parseUnits(fromValue.toString(), 18);
        await tokenContract.approve(exchange_address, formattedBal); 

        const gasEstimated: any = await exchangeContract.estimateGas.swapTokenForPair(from, to, formattedBal);

        const gasMargin = gasEstimated * 1.1;
        const exchangeTxn = await exchangeContract.swapTokenForPair(from, to, formattedBal, {
            gasLimit: Math.ceil(gasMargin),
        });
        
        // const gasPrice = await provider.getGasPrice();
        // const exchangeTxn = await exchangeContract.swapTokenForPair(from, to, formattedBal, {gasLimit: gasPrice});

        console.log(`Swapping... ${exchangeTxn.hash}`);

        const exchangeTxnStatus = await exchangeTxn.wait(1);
        if (!exchangeTxnStatus.status) {
          console.log(`Error swapping!`);
        } else {
          console.log(`Swapped-- ${exchangeTxn.hash}`);
          setValue(0.0);
        }

      }
      else{
        console.log("Ethereum object doesn't exist!");
      }

    }
    catch(error) {
      console.log(error);
    }

  }
  else{

  }

}