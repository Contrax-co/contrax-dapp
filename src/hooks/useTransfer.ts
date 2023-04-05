import { erc20ABI } from "wagmi";
import { prepareSendTransaction, sendTransaction } from "@wagmi/core";
import useWallet from "./useWallet";
import { useIsMutating } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TRANSFER_ETH, TRANSFER_TOKEN } from "src/config/constants/query";
import useConstants from "./useConstants";
import { BigNumber, Contract } from "ethers";
import useBalances from "./useBalances";
import { errorMessages } from "src/config/constants/notifyMessages";

const useTransfer = () => {
    const { signer, currentWallet } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { ethBalance } = useBalances();

    const _transferEth = async ({ to, amount, max }: { to: string; amount: BigNumber; max?: boolean }) => {
        if (max) {
            const gasPrice = await signer?.getGasPrice();
            if (!gasPrice) return;
            amount = ethBalance.sub(gasPrice.mul(21000).mul(1000));
            if (amount.lt(0)) throw { message: errorMessages.insufficientGas().message };
        }
        const transactionConfig = await prepareSendTransaction({
            request: {
                to,
                value: amount,
            },
            signer,
        });

        const res = await sendTransaction(transactionConfig);
        await res.wait();
    };

    const _transferToken = async ({
        tokenAddress,
        to,
        amount,
        max,
    }: {
        tokenAddress: string;
        to: string;
        amount: BigNumber;
        max?: boolean;
    }) => {
        const contract = new Contract(tokenAddress, erc20ABI, signer);
        if (max) {
            amount = await contract.balanceOf(currentWallet);
        }
        const res = await contract.transfer(to, amount);
        await res.wait();
    };

    const { mutateAsync: transferEth } = useMutation({
        mutationKey: TRANSFER_ETH(currentWallet, NETWORK_NAME),
        mutationFn: _transferEth,
    });

    const { mutateAsync: transferToken } = useMutation({
        mutationFn: _transferToken,
        mutationKey: TRANSFER_TOKEN(currentWallet, NETWORK_NAME),
    });

    const isMutatingEth = useIsMutating(TRANSFER_ETH(currentWallet, NETWORK_NAME));
    const isMutatingToken = useIsMutating(TRANSFER_TOKEN(currentWallet, NETWORK_NAME));

    return { transferToken, transferEth, isLoading: isMutatingEth > 0 || isMutatingToken > 0 };
};

export default useTransfer;
