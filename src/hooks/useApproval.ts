import useWallet from "./useWallet";
import { approveErc20 } from "src/api/token";
import { Address } from "viem";

export const useApprovalErc20 = () => {
    const { currentWallet, getClients } = useWallet();

    const approve = async (contractAddress: Address, spender: Address, amount: bigint, chainId: number) => {
        if (!currentWallet) return;
        const client = await getClients(chainId);
        await approveErc20(contractAddress, spender, amount, currentWallet, client);
    };

    return { approve };
};
