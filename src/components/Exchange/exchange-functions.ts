import * as ethers from 'ethers';

const exchange_address = "0xdD035b13ef190244c514f68E8F7b16555aFc89Fd";
const exchange_abi = [{"inputs":[{"internalType":"address","name":"_controller","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"controller","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushiRouter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapFromTokenToToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapPairForPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapPairForToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapTokenForPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"weth","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];



export const swapFromTokenToToken = async (
  currentWallet:any, fromValue: any, 
  from:any, to:any, setValue:any, 
  token_abi: any,
  setLoading:any,
  setLoaderMessage:any,
  setSecondaryMessage: any,
  setSuccess:any
) => {
  setSuccess("loading"); 
  setLoading(true); 
  setLoaderMessage('Swap Pending');
  if (currentWallet) {
    const { ethereum } = window;
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();

        const exchangeContract = new ethers.Contract(exchange_address, exchange_abi, signer);
        const tokenContract = new ethers.Contract(from, token_abi,signer); 

        setSecondaryMessage("Approving Token");

        /*
        * Execute the actual swap functionality from smart contract
        */
        const formattedBal = ethers.utils.parseUnits(fromValue.toString(), 18);
        await tokenContract.approve(exchange_address, formattedBal); 

        setSecondaryMessage("Confirm Contract Interaction"); 
       
        const gasPrice: any = await provider.getGasPrice();

        const exchangeTxn = await exchangeContract.swapFromTokenToToken(from, to, formattedBal, {
            gasLimit: gasPrice,
          });

        setLoaderMessage(`Swapping...`);
        setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 

        const exchangeTxnStatus = await exchangeTxn.wait(1);
        if (!exchangeTxnStatus.status) {
          setLoaderMessage(`Error swapping`); 
          setSecondaryMessage(`Try again!`);
          setSuccess("fail"); 
        } else {
          setLoaderMessage(`Swapped--`);
          setSuccess("success"); 
          setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 
          setValue(0.0);
        }
  
      }
      else{
        console.log("Ethereum object doesn't exist!");
        setLoaderMessage(`Error swapping!`);
        setSecondaryMessage(`Try again!`)
        setSuccess("fail"); 
      }

    }
    catch(error){
      console.log(error);
      // log error to screen not console 
    }

  }
  else{
    setLoaderMessage("Connect Wallet!"); 
  }
}

export const swapFromTokenToPair = async (
  currentWallet:any, from:any, to:any, 
  token_abi: any, fromValue:any, setValue:any,
  setLoading:any, 
  setLoaderMessage:any, 
  setSecondaryMessage: any,
  setSuccess: any
) => {
  setSuccess("loading"); 
  setLoading(true);
  setLoaderMessage("Swap Pending"); 
  if (currentWallet) {
    const { ethereum } = window;
    try{
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const exchangeContract = new ethers.Contract(exchange_address, exchange_abi, signer);

        const tokenContract = new ethers.Contract(from, token_abi, signer); 

        const gasPrice: any = await provider.getGasPrice();
        setSecondaryMessage("Approving Token");

         /*
        * Execute the actual swap functionality from smart contract
        */
        const formattedBal = ethers.utils.parseUnits(fromValue.toString(), 18);
        await tokenContract.approve(exchange_address, formattedBal); 

        setSecondaryMessage("Confirm Contract Interaction"); 

        const exchangeTxn = await exchangeContract.swapTokenForPair(from, to, formattedBal, {
            gasLimit: gasPrice,
        });

        setLoaderMessage(`Swapping...`);
        setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 

        const exchangeTxnStatus = await exchangeTxn.wait(1);
        if (!exchangeTxnStatus.status) {
          setLoaderMessage(`Error swapping!`);
          setSecondaryMessage(`Try again!`);
          setSuccess("fail"); 
        } else {
          setLoaderMessage(`Swapped--`);
          setSuccess("success"); 
          setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 
          setValue(0.0);
        }

      }
      else{
        console.log("Ethereum object doesn't exist!");
        setLoaderMessage(`Error swapping!`);
        setSecondaryMessage(`Try again!`)
        setSuccess("fail"); 
      }

    }
    catch(error) {
      console.log(error);
    }

  }
  else{
    setLoaderMessage("Connect wallet!")
  }

}


export const swapPairForToken = async (
  currentWallet:any, from:any, to:any, 
  token_abi:any, fromValue:any, setValue:any,
  setLoading:any, 
  setLoaderMessage:any, 
  setSecondaryMessage:any,
  setSuccess: any
) => {
  setSuccess("loading"); 
  setLoading(true); 
  setLoaderMessage("Swap Pending"); 
  if(currentWallet){
    const { ethereum } = window;
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const exchangeContract = new ethers.Contract(exchange_address, exchange_abi, signer);

        const tokenContract = new ethers.Contract(from, token_abi, signer); 

        const gasPrice: any = await provider.getGasPrice();
        setSecondaryMessage("Approving Token")

        /*
        * Execute the actual swap functionality from smart contract
        */
        const formattedBal = ethers.utils.parseUnits(fromValue.toString(), 18);
        await tokenContract.approve(exchange_address, formattedBal); 

        setSecondaryMessage("Confirm Contract Interaction"); 

        const exchangeTxn = await exchangeContract.swapPairForToken(from, to, formattedBal, {
            gasLimit: gasPrice,
        });

        setLoaderMessage(`Swapping...`);
        setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 

        const exchangeTxnStatus = await exchangeTxn.wait(1);
        if (!exchangeTxnStatus.status) {
          setLoaderMessage(`Error swapping!`);
          setSecondaryMessage(`Try again!`);
          setSuccess("fail"); 
        } else {
          setLoaderMessage(`Swapped--`);
          setSuccess("success"); 
          setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 
          setValue(0.0);
        }

      }
      else{
        console.log("Ethereum object doesn't exist!");
        setLoaderMessage(`Error swapping!`);
        setSecondaryMessage(`Try again!`)
        setSuccess("fail"); 
      }

    }
    catch(error) {
      console.log(error);
    }

  }
  else{
    setLoaderMessage("Connect Wallet!")
  }
}


export const swapPairForPair = async (
  currentWallet:any, from:any, to:any, 
  token_abi:any, fromValue:any, setValue:any,
  setLoading:any,setLoaderMessage:any,
  setSecondaryMessage:any,
  setSuccess:any
) => {
  setSuccess("loading"); 
  setLoading(true); 
  setLoaderMessage("Swap Pending")
  if(currentWallet){
    const { ethereum } = window;
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const exchangeContract = new ethers.Contract(exchange_address, exchange_abi, signer);

        const tokenContract = new ethers.Contract(from, token_abi, signer); 

        const gasPrice: any = await provider.getGasPrice();

        setSecondaryMessage("Approving Token")

        /*
        * Execute the actual swap functionality from smart contract
        */
        const formattedBal = ethers.utils.parseUnits(fromValue.toString(), 18);
        await tokenContract.approve(exchange_address, formattedBal); 

        setSecondaryMessage("Confirm Contract Interaction"); 

        const exchangeTxn = await exchangeContract.swapPairForPair(from, to, formattedBal, {
            gasLimit: gasPrice,
        });

        setLoaderMessage(`Swapping...`);
        setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 

        const exchangeTxnStatus = await exchangeTxn.wait(1);

        if (!exchangeTxnStatus.status) {
          setLoaderMessage(`Error swapping!`);
          setSecondaryMessage(`Try again!`)
          setSuccess("fail"); 
        } else {
          setLoaderMessage(`Swapped--`);
          setSuccess("success"); 
          setSecondaryMessage(`Txn hash: ${exchangeTxn.hash}`); 
          setValue(0.0);
        }

      }
      else{
        console.log("Ethereum object doesn't exist!");
        setLoaderMessage(`Error swapping!`);
        setSecondaryMessage(`Try again!`)
        setSuccess("fail"); 
      }

    }
    catch(error) {
      console.log(error);
    }

  }
  else{
    setLoaderMessage("Connect Wallet!")
  }
}
