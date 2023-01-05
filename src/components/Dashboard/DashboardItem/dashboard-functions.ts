import * as ethers from "ethers";

export const userTokenValue = async (currentWallet: any, vault: any, setUserVaultBalance: any) => {
  if (currentWallet) {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const vaultContract = new ethers.Contract(vault.vault_address, vault.vault_abi, signer);

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
    console.log(`Connect Wallet`);
  }
};
