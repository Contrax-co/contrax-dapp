import { Address, erc20Abi, getContract, zeroAddress } from "viem";
import useWallet from "./useWallet";
import { useIsMutating } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TRANSFER_TOKEN } from "src/config/constants/query";
import useConstants from "./useConstants";
import { errorMessages } from "src/config/constants/notifyMessages";
import { awaitTransaction, getConnectorId, subtractGas } from "src/utils/common";

const useTransfer = () => {
    const { currentWallet, client, isSponsored } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const _transferEth = async ({ to, amount, max }: { to: Address; amount: bigint; max?: boolean }) => {
        if (!client.wallet || !currentWallet) return;
        const balance = await client.public.getBalance({ address: currentWallet });
        if (max) amount = balance;
        if (!isSponsored) {
            const afterGasCut = await subtractGas(
                amount,
                client,
                client.wallet.estimateTxGas({
                    to: to,
                    value: amount,
                    data: "0x",
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
            client.wallet.sendTransaction({
                to,
                value: amount,
            }),
            client
        );
        return response;
    };

    const _transferToken = async ({
        tokenAddress,
        to,
        amount,
        max,
    }: {
        tokenAddress: Address;
        to: Address;
        amount: bigint;
        max?: boolean;
    }) => {
        if (!currentWallet) return;
        const contract = getContract({
            address: tokenAddress,
            abi: erc20Abi,
            client,
        });
        if (max) {
            amount = await contract.read.balanceOf([currentWallet]);
        }
        const response = await awaitTransaction(contract.write.transfer([to, amount]), client);
        return response;
    };

    const _transfer = async (transferInfo: { tokenAddress: Address; to: Address; amount: bigint; max?: boolean }) => {
        return transferInfo.tokenAddress === zeroAddress ? _transferEth(transferInfo) : _transferToken(transferInfo);
    };

    const { mutateAsync: transfer } = useMutation({
        mutationFn: _transfer,
        mutationKey: TRANSFER_TOKEN(currentWallet!, NETWORK_NAME),
    });

    const isMutatingToken = useIsMutating({ mutationKey: TRANSFER_TOKEN(currentWallet!, NETWORK_NAME) });

    return { transfer, isLoading: isMutatingToken > 0 };
};

export default useTransfer;
