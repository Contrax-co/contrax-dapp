import { erc20Abi } from "viem";
import { prepareSendTransaction, sendTransaction } from "@wagmi/core";
import useWallet from "./useWallet";
import { useIsMutating } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TRANSFER_TOKEN } from "src/config/constants/query";
import useConstants from "./useConstants";
import useBalances from "./useBalances";
import { errorMessages } from "src/config/constants/notifyMessages";
import { awaitTransaction, getConnectorId, subtractGas } from "src/utils/common";
import { notifyError } from "src/api/notify";
import { web3AuthConnectorId } from "src/config/constants";
import { isGasSponsored } from "src/api";

const useTransfer = () => {
    const { currentWallet, client, isSponsored } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const _transferEth = async ({ to, amount, max }: { to: string; amount: bigint; max?: boolean }) => {
        if (!client.wallet || !currentWallet) return;
        const balance = await client.public.getBalance({ address: currentWallet });
        if (max) amount = balance;
        if (!isSponsored) {
            const afterGasCut = await subtractGas(
                amount,
                signer,
                signer.estimateGas({
                    to,
                    value: amount,
                }),
                false,
                balance
            );
            if (!afterGasCut) {
                throw { message: errorMessages.insufficientGas().message };
            }
            amount = afterGasCut;
        }
        const response = await awaitTransaction(
            signer?.sendTransaction({
                to,
                value: amount,
            })
        );
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
        const tx = await contract.populateTransaction.transfer(to, amount);
        console.log(tx);
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
