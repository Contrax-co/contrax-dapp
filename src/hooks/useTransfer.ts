import { Address, erc20Abi, getContract, zeroAddress } from "viem";
import useWallet from "./useWallet";
import { useIsMutating } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TRANSFER_TOKEN } from "src/config/constants/query";
import useConstants from "./useConstants";
import { errorMessages } from "src/config/constants/notifyMessages";
import { awaitTransaction, getNetworkName, subtractGas } from "src/utils/common";

const useTransfer = () => {
    const { currentWallet, estimateTxGas, isSponsored, getClients } = useWallet();

    const _transferEth = async ({
        to,
        amount,
        max,
        chainId,
    }: {
        to: Address;
        amount: bigint;
        max?: boolean;
        chainId: number;
    }) => {
        if (!currentWallet) return;
        const client = await getClients(chainId);
        const balance = await client.public.getBalance({ address: currentWallet });
        if (max) amount = balance;
        if (!isSponsored) {
            const afterGasCut = await subtractGas(
                amount,
                client,
                estimateTxGas({
                    chainId,
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
        chainId,
    }: {
        tokenAddress: Address;
        to: Address;
        amount: bigint;
        max?: boolean;
        chainId: number;
    }) => {
        if (!currentWallet) return;
        const client = await getClients(chainId);

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

    const _transfer = async (transferInfo: {
        tokenAddress: Address;
        to: Address;
        amount: bigint;
        max?: boolean;
        chainId: number;
    }) => {
        return transferInfo.tokenAddress === zeroAddress ? _transferEth(transferInfo) : _transferToken(transferInfo);
    };

    const { mutateAsync: transfer } = useMutation({
        mutationFn: _transfer,
        mutationKey: TRANSFER_TOKEN(currentWallet!),
    });

    const isMutatingToken = useIsMutating({ mutationKey: TRANSFER_TOKEN(currentWallet!) });

    return { transfer, isLoading: isMutatingToken > 0 };
};

export default useTransfer;
