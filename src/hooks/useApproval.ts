import useWallet from "./useWallet";
import erc20 from "src/assets/abis/erc20.json";
import * as ethers from "ethers";

export const useApprovalErc20 = () => {
    const { signer, currentWallet } = useWallet();

    const approve = async (contractAddress: string, spender: string, amount: ethers.BigNumber) => {
        const contract = new ethers.Contract(contractAddress, erc20.abi, signer);
        // check allowance
        const allowance = await contract.allowance(currentWallet, spender);
        // if allowance is lower than amount, approve
        if (amount.gt(allowance)) {
            // approve
            await contract.approve(spender, ethers.constants.MaxUint256);
        }
    };

    return { approve };
};
