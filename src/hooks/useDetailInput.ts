import React, { useCallback, useEffect, useState } from "react";
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
    const [slippage, setSlippage] = useState<number>();
    const [fetchingSlippage, setFetchingSlippage] = useState(false);
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
    const { isLoading: isZapping, zapInAsync, slippageZapIn } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync, slippageDeposit } = useDeposit(farm);
    const { isLoading: isZappingOut, zapOutAsync, slippageZapOut } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync, slippageWithdraw } = useWithdraw(farm);
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
                return amt;
                // if (depositable?.tokenAddress === farm.lp_address) {
                // } else {
                //     return amt;
                // }
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
    };

    const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setAmount(e.target.value);
        setMax(false);
    };

    const handleSubmit = async () => {
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

    const fetchSlippage = async () => {
        try {
            const amnt = getTokenAmount();
            let _slippage = NaN;
            if (type === FarmTransactionType.Deposit) {
                if (depositable?.tokenAddress === farm.lp_address) {
                    const res = await slippageDeposit({ depositAmount: amnt, max });
                    console.log(res);
                    _slippage = res.slippage;
                } else {
                    const res = await slippageZapIn({ zapAmount: amnt, max, token: depositable?.tokenAddress! });
                    console.log(res);
                    _slippage = res.slippage;
                }
            } else {
                if (withdrawable?.tokenAddress === farm.lp_address) {
                    const res = await slippageWithdraw({ withdrawAmount: amnt, max });
                    console.log(res);
                    _slippage = res.slippage;
                } else {
                    const res = await slippageZapOut({ withdrawAmt: amnt, max, token: withdrawable?.tokenAddress! });
                    console.log(res);
                    _slippage = res.slippage;
                }
            }
            if (_slippage.toString())
                setSlippage(_slippage === 0 ? 0.01 : _slippage); // temporary hardcoding 0.01% slippage instead of zero
            else setSlippage(undefined);
        } catch (err) {
            console.log(`%cError Slippage: ${err}`, "color: magenta;");
            setSlippage(undefined);
        }
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
        if (
            depositable?.amountDollar !== _depositable?.amountDollar ||
            withdrawable?.amountDollar !== _withdrawable?.amountDollar
        )
            setMax(false);
    }, [currencySymbol, farmData]);

    useEffect(() => {
        if (getTokenAmount() === 0) {
            setSlippage(undefined);
            return;
        }

        console.log("%cAmount changed", "color: lightgreen;");
        setFetchingSlippage(true);
        const int = setTimeout(async () => {
            console.log("%cFetching slippage", "color: lightgreen;");
            await fetchSlippage();
            setFetchingSlippage(false);
        }, 2000);
        return () => {
            clearTimeout(int);
        };
    }, [max, amount, showInUsd, type, depositable?.tokenAddress, withdrawable?.tokenAddress]);

    return {
        type,
        amount,
        slippage,
        showInUsd,
        currentWallet,
        maxBalance,
        setMax,
        fetchingSlippage,
        handleToggleShowInUsdc,
        handleInput,
        handleSubmit,
        isLoadingTransaction: isZapping || isZappingOut || isDepositing || isWithdrawing,
        isLoadingFarm: isLoading,
    };
};
