import React, { useEffect, useState } from "react";
import useDeposit from "src/hooks/farms/useDeposit";
import useWithdraw from "src/hooks/farms/useWithdraw";
import useZapIn from "src/hooks/farms/useZapIn";
import useZapOut from "src/hooks/farms/useZapOut";
import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import { useEstimateGasFee } from "src/hooks/useEstmaiteGasFee";
import useWallet from "src/hooks/useWallet";
import { useAppDispatch, useAppSelector } from "src/state";
import usePriceOfTokens from "./usePriceOfTokens";
import { setFarmDetailInputOptions } from "src/state/farms/farmsReducer";

export const useDetailInput = (farm: Farm) => {
    const [amount, setAmount] = useState("");
    const [max, setMax] = useState(false);
    const {
        transactionType: type,
        currencySymbol,
        showInUsd,
    } = useAppSelector((state) => state.farms.farmDetailInputOptions);
    const dispatch = useAppDispatch();

    const setShowInUsd = (val: boolean) => {
        dispatch(setFarmDetailInputOptions({ showInUsd: val }));
    };

    const { isBalanceTooLow } = useEstimateGasFee();
    const { prices } = usePriceOfTokens();
    const { isLoading: isZapping, zapInAsync } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync } = useDeposit(farm);
    const { isLoading: isZappingOut, zapOutAsync } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync } = useWithdraw(farm);
    const { farmDetails, isLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];
    const { currentWallet } = useWallet();
    const [depositable, setDepositable] = React.useState(farmData?.depositableAmounts[0]);
    const [withdrawable, setWithdrawable] = React.useState(farmData?.withdrawableAmounts[0]);

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
        setShowInUsd(!showInUsd);

        setAmount("");
    };

    const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setAmount(e.target.value);
        setMax(false);
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        // check for eth balance greater than gas fee
        // if (isBalanceTooLow()) return;
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
    }, [max, maxBalance, showInUsd]);

    useEffect(() => {
        let _depositable = farmData?.depositableAmounts.find((item) => item.tokenSymbol === currencySymbol);
        if (!_depositable) {
            _depositable = farmData?.depositableAmounts[0];
        }
        setDepositable(_depositable);

        let _withdrawable = farmData?.withdrawableAmounts.find((item) => item.tokenSymbol === currencySymbol);
        if (!_withdrawable) {
            _withdrawable = farmData?.withdrawableAmounts[0];
        }
        setWithdrawable(_withdrawable);
        setMax(false);
        setAmount("");
    }, [currencySymbol, farmData]);

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
