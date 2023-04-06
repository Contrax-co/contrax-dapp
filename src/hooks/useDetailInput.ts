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
import usePriceOfTokens from "./usePriceOfTokens";

export const useDetailInput = (farm: Farm) => {
    const [amount, setAmount] = useState("");
    const [max, setMax] = useState(false);
    const type = useAppSelector((state) => state.farms.farmDetailInputOptions.transactionType);

    const [showInUsd, setShowInUsd] = useState<boolean>(true);

    const { isBalanceTooLow } = useEstimateGasFee();
    const { prices } = usePriceOfTokens();
    const { isLoading: isZapping, zapInAsync } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync } = useDeposit(farm);
    const { isLoading: isZappingOut, zapOutAsync } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync } = useWithdraw(farm);
    const { farmDetails, isLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];
    const { currentWallet } = useWallet();
    const [depositable, setDepositable] = React.useState(farmData?.Depositable_Amounts[0]);
    const [withdrawable, setWithdrawable] = React.useState(farmData?.Withdrawable_Amounts[0]);
    console.log({ type, farmData, farmDetails });

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
        let amt = Number(amount);
        if (!depositable) return amt;
        if (type === FarmTransactionType.Deposit) {
            if (showInUsd) {
                return amt / depositable.price;
            } else {
                if (depositable?.tokenAddress === farm.lp_address) {
                    return amt;
                } else {
                    return amt;
                }
            }
        } else {
            if (showInUsd) {
                return amt / prices[farm.lp_address];
            } else {
                return (amt * withdrawable?.price!) / prices[farm.lp_address];
            }
        }
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
        console.log(depositable?.tokenAddress === farm.lp_address, showInUsd, type === FarmTransactionType.Deposit);
        // check for eth balance greater than gas fee
        if (isBalanceTooLow()) return;
        // if enough balance than proceed transaction
        if (type === FarmTransactionType.Deposit) {
            if (depositable?.tokenAddress === farm.lp_address) {
                await depositAsync({ depositAmount: getTokenAmount(), max });
            } else {
                await zapInAsync({ zapAmount: getTokenAmount(), max, token: depositable?.tokenAddress! });
            }
        } else {
            if (withdrawable?.tokenAddress === farm.lp_address) {
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
