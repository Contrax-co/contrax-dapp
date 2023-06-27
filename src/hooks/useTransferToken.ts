import { Token } from "src/types";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";
import { FormEvent, useEffect, useState } from "react";
import useTransfer from "./useTransfer";
import { toWei } from "src/utils/common";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";

export const useTransferToken = (token: Token, handleClose: Function) => {
    const { reloadBalances } = useBalances();
    const [receiverAddress, setReceiverAddress] = useState<string>("");
    const [amount, setAmount] = useState("");
    const [showInUsd, toggleShowInUsd] = useState<boolean>(true);
    const { transfer, isLoading } = useTransfer();
    const [max, setMax] = useState(false);

    const getAmountInWei = () => {
        const price = token.price;
        let amountInEthFormat = showInUsd ? (parseFloat(amount) / price).toString() : amount;
        console.log(amount, price, amountInEthFormat, token.decimals);
        const converted = toWei(amountInEthFormat, token.decimals);
        return converted;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const id = notifyLoading(loadingMessages.transferingTokens());
        try {
            const res = await transfer({
                tokenAddress: token.address,
                to: receiverAddress,
                amount: getAmountInWei(),
                max,
            });
            if (res?.error) throw new Error(res.error);
            notifySuccess(successMessages.tokenTransfered());
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error.message || "Error transfering tokens..."));
            notifyError(errorMessages.generalError(err));
        }

        dismissNotify(id);
        handleClose();
        reloadBalances();
    };

    const handleMaxClick = () => {
        setMax(true);
        setAmount(showInUsd ? token.usdBalance : token.balance);
    };

    const handleToggleShowInUsdc = () => {
        toggleShowInUsd((prev) => !prev);
    };

    useEffect(() => {
        if (max) handleMaxClick();
    }, [showInUsd]);

    return {
        isLoading,
        showInUsd,
        amount,
        setAmount,
        receiverAddress,
        setReceiverAddress,
        setMax,
        handleSubmit,
        handleMaxClick,
        handleToggleShowInUsdc,
    };
};
