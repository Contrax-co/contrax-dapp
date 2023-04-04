import React, { useEffect, useState } from "react";
import useDeposit from "src/hooks/farms/useDeposit";
import useWithdraw from "src/hooks/farms/useWithdraw";
import useZapIn from "src/hooks/farms/useZapIn";
import useZapOut from "src/hooks/farms/useZapOut";
import useEthPrice from "src/hooks/useEthPrice";
import { Farm } from "src/types";
import { FarmTransactionType, TransactionCurrency } from "src/types/enums";
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
    const [transactionCurrency, setTransationCurrency] = useState<TransactionCurrency>(TransactionCurrency.USDC);
    const type = useAppSelector((state) => state.farms.transactionType);
    const { isBalanceTooLow } = useEstimateGasFee();
    const { price: ethPrice } = useEthPrice();
    const { isLoading: isZapping, zapInAsync } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync } = useDeposit(farm);
    const { isLoading: isZappingOut, zapOutAsync } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync } = useWithdraw(farm);
    const { farmDetails, isLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];
    const priceOfSingleToken = farmData?.TOKEN_PRICE || 0;
    const { currentWallet } = useWallet();

    const maxBalance = React.useMemo(() => {
        if (type === FarmTransactionType.Deposit) {
            if (showInUsd) {
                switch (transactionCurrency) {
                    case TransactionCurrency.USDC:
                        return 0;
                    case TransactionCurrency.ETH:
                        return parseFloat(farmData?.Max_Zap_Deposit_Balance_Dollar || "0");
                    case TransactionCurrency.LP_Token:
                        return parseFloat(farmData?.Max_Token_Deposit_Balance_Dollar || "0");

                    default:
                        return 0;
                }
            } else {
                switch (transactionCurrency) {
                    case TransactionCurrency.USDC:
                        return 0;
                    case TransactionCurrency.ETH:
                        return parseFloat(farmData?.Max_Zap_Deposit_Balance || "0");
                    case TransactionCurrency.LP_Token:
                        return parseFloat(farmData?.Max_Token_Deposit_Balance || "0");

                    default:
                        return 0;
                }
            }
        } else {
            if (showInUsd) {
                switch (transactionCurrency) {
                    case TransactionCurrency.USDC:
                        return 0;
                    case TransactionCurrency.ETH:
                        return parseFloat(farmData?.Max_Zap_Withdraw_Balance_Dollar || "0");
                    case TransactionCurrency.LP_Token:
                        return parseFloat(farmData?.Max_Token_Withdraw_Balance_Dollar || "0");

                    default:
                        return 0;
                }
            } else {
                switch (transactionCurrency) {
                    case TransactionCurrency.USDC:
                        return 0;
                    case TransactionCurrency.ETH:
                        return parseFloat(farmData?.Max_Zap_Withdraw_Balance || "0");
                    case TransactionCurrency.LP_Token:
                        return parseFloat(farmData?.Max_Token_Withdraw_Balance || "0");

                    default:
                        return 0;
                }
            }
        }
    }, [showInUsd, type, farmData]);

    const dontShowUsdSelect = React.useMemo(() => {
        switch (farm.name) {
            case "Usdt":
                return true;
            case "Usdc":
                return true;
            default:
                return false;
        }
    }, [farm]);

    const getTokenAmount = () => {
        let amt = 0;
        if (farmData) {
            if (showInUsd) {
                switch (transactionCurrency) {
                    case TransactionCurrency.USDC:
                        //
                        break;
                    case TransactionCurrency.ETH:
                        if (type === FarmTransactionType.Deposit) {
                            amt = parseFloat(amount) / farmData.ZAP_TOKEN_PRICE;
                        } else {
                            amt = parseFloat(amount) / farmData.TOKEN_PRICE;
                        }
                        break;
                    case TransactionCurrency.LP_Token:
                        amt = parseFloat(amount) / farmData.TOKEN_PRICE;
                        break;

                    default:
                        amt = 0;
                        break;
                }
            } else {
                switch (transactionCurrency) {
                    case TransactionCurrency.USDC:
                        //
                        break;
                    case TransactionCurrency.ETH:
                        if (type === FarmTransactionType.Deposit) {
                            amt = parseFloat(amount);
                        } else {
                            amt = (parseFloat(amount) * farmData.ZAP_TOKEN_PRICE) / farmData.TOKEN_PRICE;
                        }
                        break;
                    case TransactionCurrency.LP_Token:
                        amt = parseFloat(amount);
                        break;

                    default:
                        amt = 0;
                        break;
                }
            }
        }
        return Number(validateNumberDecimals(amt, farm.decimals));
    };

    const handleToggleShowInUsdc = () => {
        setShowInUsd((prev) => !prev);

        if (showInUsd) {
            switch (transactionCurrency) {
                case TransactionCurrency.USDC:
                    //
                    break;
                case TransactionCurrency.ETH:
                    setAmount((prev) => (parseFloat(prev) * ethPrice).toString());
                    break;
                case TransactionCurrency.LP_Token:
                    setAmount((prev) => (parseFloat(prev) * priceOfSingleToken).toString());
                    break;

                default:
                    break;
            }
        } else {
            switch (transactionCurrency) {
                case TransactionCurrency.USDC:
                    //
                    break;
                case TransactionCurrency.ETH:
                    setAmount((prev) => (parseFloat(prev) / ethPrice).toString());
                    break;
                case TransactionCurrency.LP_Token:
                    setAmount((prev) => (parseFloat(prev) / priceOfSingleToken).toString());
                    break;

                default:
                    break;
            }
        }
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
            switch (transactionCurrency) {
                case TransactionCurrency.USDC:
                    //
                    break;
                case TransactionCurrency.ETH:
                    await zapInAsync({ zapAmount: getTokenAmount(), max, token: constants.AddressZero });
                    break;
                case TransactionCurrency.LP_Token:
                    await depositAsync({ depositAmount: getTokenAmount(), max });
                    break;

                default:
                    break;
            }
        } else {
            switch (transactionCurrency) {
                case TransactionCurrency.USDC:
                    //
                    break;
                case TransactionCurrency.ETH:
                    await zapOutAsync({ withdrawAmt: getTokenAmount(), max, token: constants.AddressZero });
                    break;
                case TransactionCurrency.LP_Token:
                    await withdrawAsync({ withdrawAmount: getTokenAmount(), max });
                    break;
                default:
                    break;
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
        dontShowUsdSelect,
        setMax,
        handleToggleShowInUsdc,
        handleInput,
        handleSubmit,
        isLoadingTransaction: isZapping || isZappingOut || isDepositing || isWithdrawing,
        isLoadingFarm: isLoading,
    };
};
