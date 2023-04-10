import { erc20ABI } from "wagmi";
import { prepareSendTransaction, sendTransaction } from "@wagmi/core";
import useWallet from "./useWallet";
import { useIsMutating } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TRANSFER_TOKEN } from "src/config/constants/query";
import useConstants from "./useConstants";
import { BigNumber, Contract, constants } from "ethers";
import useBalances from "./useBalances";
import { errorMessages } from "src/config/constants/notifyMessages";
import { awaitTransaction } from "src/utils/common";

const useTransfer = () => {
    const { signer, currentWallet } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { ethBalance } = useBalances();

    const _transferEth = async ({ to, amount, max }: { to: string; amount: BigNumber; max?: boolean }) => {
        if (max) {
            // TOOD: don't calculate gas for zero dev wallet
            const gasPrice = await signer?.getGasPrice();
            if (!gasPrice) return;
            amount = ethBalance.sub(gasPrice.mul(21000).mul(1000));
            if (amount.lte(0)) throw { message: errorMessages.insufficientGas().message };
        }
        const transactionConfig = await prepareSendTransaction({
            request: {
                to,
                value: amount,
            },
            signer,
        });

        const response = await awaitTransaction(sendTransaction(transactionConfig));
        return response;
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
        const response = await awaitTransaction(contract.transfer(to, amount));
        return response;
    };

    const _transfer = async (transferInfo: { tokenAddress: string; to: string; amount: BigNumber; max?: boolean }) => {
        return transferInfo.tokenAddress === constants.AddressZero
            ? _transferEth(transferInfo)
            : _transferToken(transferInfo);
    };

    const { mutateAsync: transfer } = useMutation({
        mutationFn: _transfer,
        mutationKey: TRANSFER_TOKEN(currentWallet, NETWORK_NAME),
    });

    const isMutatingToken = useIsMutating(TRANSFER_TOKEN(currentWallet, NETWORK_NAME));

    return { transfer, isLoading: isMutatingToken > 0 };
};

export default useTransfer;
