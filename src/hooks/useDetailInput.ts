import React, { useEffect, useState } from "react";
import useDeposit from "src/hooks/farms/useDeposit";
import useWithdraw from "src/hooks/farms/useWithdraw";
import useZapIn from "src/hooks/farms/useZapIn";
import useZapOut from "src/hooks/farms/useZapOut";
import useEthPrice from "src/hooks/useEthPrice";
import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { validateNumberDecimals } from "src/utils/common";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import { useEstimateGasFee } from "src/hooks/useEstmaiteGasFee";
import useWallet from "src/hooks/useWallet";
import { useAppSelector } from "src/state";
import { constants } from "ethers";

export const useDetailInput = (farm: Farm) => {
    const [amount, setAmount] = useState("");
    const [showInUsd, setShowInUsd] = useState<boolean>(true);
    const [max, setMax] = useState(false);

    const type = useAppSelector((state) => state.farms.transactionType);
    const { isBalanceTooLow } = useEstimateGasFee();
    const { price: ethPrice } = useEthPrice();
    const { isLoading: isZapping, zapInAsync } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync } = useDeposit(farm);
    const { isLoading: isZappingOut, zapOutAsync } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync } = useWithdraw(farm);
    const { farmDetails, isLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];
    const { currentWallet } = useWallet();
    const [depositable, setDepositable] = React.useState(farmData?.Depositable_Amounts[0]);
    const [withdrawable, setWithdrawable] = React.useState(farmData?.Withdrawable_Amounts[0]);

    const maxBalance = React.useMemo(() => {
        if (type === FarmTransactionType.Deposit) {
            if (showInUsd) {
                return depositable?.amountDollar || "0";
            } else {
                return depositable?.amount || "0";
            }
        } else {
            if (showInUsd) {
                return withdrawable?.amountDollar || "0";
            } else {
                return withdrawable?.amount || "0";
            }
        }
    }, [showInUsd, depositable, withdrawable, type]);

    const getTokenAmount = () => {
        let amt = amount;
        // if (farmData) {
        //     if (showInUsd) {
        //         switch (transactionCurrency) {
        //             case TransactionCurrency.USDC:
        //                 //
        //                 break;
        //             case TransactionCurrency.ETH:
        //                 if (type === FarmTransactionType.Deposit) {
        //                     amt = parseFloat(amount) / farmData.ZAP_TOKEN_PRICE;
        //                 } else {
        //                     amt = parseFloat(amount) / farmData.TOKEN_PRICE;
        //                 }
        //                 break;
        //             case TransactionCurrency.LP_Token:
        //                 amt = parseFloat(amount) / farmData.TOKEN_PRICE;
        //                 break;

        //             default:
        //                 amt = 0;
        //                 break;
        //         }
        //     } else {
        //         switch (transactionCurrency) {
        //             case TransactionCurrency.USDC:
        //                 //
        //                 break;
        //             case TransactionCurrency.ETH:
        //                 if (type === FarmTransactionType.Deposit) {
        //                     amt = parseFloat(amount);
        //                 } else {
        //                     amt = (parseFloat(amount) * farmData.ZAP_TOKEN_PRICE) / farmData.TOKEN_PRICE;
        //                 }
        //                 break;
        //             case TransactionCurrency.LP_Token:
        //                 amt = parseFloat(amount);
        //                 break;

        //             default:
        //                 amt = 0;
        //                 break;
        //         }
        //     }
        // }
        // return Number(validateNumberDecimals(amt, farm.decimals));
        return Number(amt);
    };

    const handleToggleShowInUsdc = () => {
        setShowInUsd((prev) => !prev);

        setAmount("0");
    };

    const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setAmount(e.target.value);
        setMax(false);
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        // check for eth balance greater than gas fee
        if (isBalanceTooLow()) return;
        // if enough balance than proceed transaction
        if (type === FarmTransactionType.Deposit) {
            if (showInUsd) {
            } else {
                if (depositable?.tokenSymbol === farm.name) {
                    await depositAsync({ depositAmount: getTokenAmount(), max });
                } else {
                    await zapInAsync({ zapAmount: getTokenAmount(), max, token: depositable?.tokenAddress! });
                }
            }
        } else {
            if (depositable?.tokenSymbol === farm.name) {
                await withdrawAsync({ withdrawAmount: getTokenAmount(), max });
            } else {
                await zapOutAsync({ withdrawAmt: getTokenAmount(), max, token: withdrawable?.tokenAddress! });
            }
        }

        setAmount("");
        setMax(false);
    };

    useEffect(() => {
        if (max) setAmount(maxBalance.toString());
    }, [max, maxBalance]);

    return {
        type,
        amount,
        showInUsd,
        currentWallet,
        maxBalance,
        setMax,
        handleToggleShowInUsdc,
        handleInput,
        handleSubmit,
        isLoadingTransaction: isZapping || isZappingOut || isDepositing || isWithdrawing,
        isLoadingFarm: isLoading,
    };
};
