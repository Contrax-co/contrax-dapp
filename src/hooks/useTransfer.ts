import { useEffect, useState, useMemo } from "react";
import { usePrepareSendTransaction, erc20ABI } from "wagmi";
import { prepareSendTransaction, sendTransaction } from "@wagmi/core";
import useWallet from "./useWallet";
import { toEth, toWei } from "src/utils/common";
import { useIsMutating } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TRANSFER_ETH, TRANSFER_TOKEN } from "src/config/constants/query";
import useConstants from "./useConstants";
import { Contract } from "ethers";

const useTransfer = () => {
    const { signer, currentWallet } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const _transferEth = async ({ to, amount }: { to: string; amount: number | string }) => {
        const transactionConfig = await prepareSendTransaction({
            request: {
                to,
                value: toWei(amount.toString()),
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
    }: {
        tokenAddress: string;
        to: string;
        amount: number;
    }) => {
        const contract = new Contract(tokenAddress, erc20ABI, signer);
        const res = await contract.transfer(to, toWei(amount.toString()));
        await res.wait();
    };

    const { mutateAsync: transferEth } = useMutation({
        mutationKey: TRANSFER_ETH(currentWallet, NETWORK_NAME),
        mutationFn: _transferEth,
    });

    const { mutateAsync: transferToken } = useMutation({
        // @ts-ignore
        mutationFn: _transferToken,
        mutationKey: TRANSFER_TOKEN(currentWallet, NETWORK_NAME),
    });

    const isMutatingEth = useIsMutating(TRANSFER_ETH(currentWallet, NETWORK_NAME));
    const isMutatingToken = useIsMutating(TRANSFER_TOKEN(currentWallet, NETWORK_NAME));

    return { transferToken, transferEth, isLoading: isMutatingEth > 0 || isMutatingToken > 0 };
};

export default useTransfer;
