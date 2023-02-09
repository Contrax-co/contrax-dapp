import useWallet from "./useWallet";
import erc20 from "src/assets/abis/erc20.json";
import * as ethers from "ethers";
import { approveErc20 } from "src/api/token";

export const useApprovalErc20 = () => {
    const { signer, currentWallet } = useWallet();

    const approve = async (contractAddress: string, spender: string, amount: ethers.BigNumber) => {
        if (!signer) return;
        await approveErc20(contractAddress, spender, amount, currentWallet, signer);
    };

    return { approve };
};
