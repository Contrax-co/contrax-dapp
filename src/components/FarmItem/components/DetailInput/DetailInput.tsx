import React from "react";
import useApp from "src/hooks/useApp";
import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { noExponents, toFixedFloor } from "src/utils/common";
import styles from "./DetailInput.module.scss";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import Loader from "src/components/Loader/Loader";
import { useDetailInput } from "src/hooks/useDetailInput";

interface Props {
    farm: Farm;
    shouldUseLp: boolean;
    type: FarmTransactionType;
}

const DetailInput: React.FC<Props> = ({ shouldUseLp, farm }) => {
    const { lightMode } = useApp();
    const {
        type,
        amount,
        showInUsd,
        currentWallet,
        maxBalance,
        dontShowUsdSelect,
        setMax,
        handleInput,
        handleSubmit,
        handleToggleShowInUsdc,
        isLoadingFarm,
        isLoadingTransaction,
    } = useDetailInput(farm);

    // const maxBalance = React.useMemo(() => {
    //     if (type === FarmTransactionType.Deposit) {
    //         if (shouldUseLp) {
    //             return showInUsd
    //                 ? parseFloat(farmData?.Max_Token_Deposit_Balance_Dollar || "0")
    //                 : parseFloat(farmData?.Max_Token_Deposit_Balance || "0");
    //         } else {
    //             return showInUsd
    //                 ? parseFloat(farmData?.Max_Zap_Deposit_Balance_Dollar || "0")
    //                 : parseFloat(farmData?.Max_Zap_Deposit_Balance || "0");
    //         }
    //     } else {
    //         if (shouldUseLp) {
    //             return showInUsd
    //                 ? parseFloat(farmData?.Max_Token_Withdraw_Balance_Dollar || "0")
    //                 : parseFloat(farmData?.Max_Token_Withdraw_Balance || "0");
    //         } else {
    //             return showInUsd
    //                 ? parseFloat(farmData?.Max_Zap_Withdraw_Balance_Dollar || "0")
    //                 : parseFloat(farmData?.Max_Zap_Withdraw_Balance || "0");
    //         }
    //     }
    // }, [shouldUseLp, showInUsd, type, farmData]);

    // const getTokenAmount = () => {
    //     let amt = 0;
    //     if (farmData)
    //         if (shouldUseLp) {
    //             if (showInUsd) amt = parseFloat(amount) / farmData.TOKEN_PRICE;
    //             else amt = parseFloat(amount);
    //         } else {
    //             if (type === FarmTransactionType.Deposit) {
    //                 if (showInUsd) amt = parseFloat(amount) / farmData.ZAP_TOKEN_PRICE;
    //                 else amt = parseFloat(amount);
    //             } else {
    //                 if (showInUsd) amt = parseFloat(amount) / farmData.TOKEN_PRICE;
    //                 else amt = (parseFloat(amount) * farmData.ZAP_TOKEN_PRICE) / farmData.TOKEN_PRICE;
    //             }
    //         }
    //     return Number(validateNumberDecimals(amt, farm.decimals));
    // };

    // const handleShowInUsdChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    //     setShowInUsd(e.target.value === "true");

    //     if (e.target.value === "true") {
    //         if (!shouldUseLp) {
    //             setAmount((prev) => (parseFloat(prev) * ethPrice).toString());
    //         } else {
    //             setAmount((prev) => (parseFloat(prev) * priceOfSingleToken).toString());
    //         }
    //     } else {
    //         if (!shouldUseLp) {
    //             setAmount((prev) => (parseFloat(prev) / ethPrice).toString());
    //         } else {
    //             setAmount((prev) => (parseFloat(prev) / priceOfSingleToken).toString());
    //         }
    //     }
    // };

    // const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    //     e.preventDefault();
    //     // check for eth balance greater than gas fee
    //     if (isBalanceTooLow()) return;
    //     if (type === FarmTransactionType.Deposit) {
    //         if (shouldUseLp) {
    //             await depositAsync({ depositAmount: getTokenAmount(), max });
    //         } else {
    //             await zapInAsync({ ethZapAmount: getTokenAmount(), max });
    //         }
    //     } else {
    //         if (shouldUseLp) {
    //             await withdrawAsync({ withdrawAmount: getTokenAmount(), max });
    //         } else {
    //             await zapOutAsync({ withdrawAmt: getTokenAmount(), max });
    //         }
    //     }
    //     setAmount("");
    //     setMax(false);
    // };

    // const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    //     setAmount(e.target.value);
    //     setMax(false);
    // };

    // const dontShowUsdSelect = React.useMemo(() => {
    //     switch (farm.name) {
    //         case "Usdt":
    //             return true;
    //         case "Usdc":
    //             return true;
    //         default:
    //             return false;
    //     }
    // }, [farm]);

    // React.useEffect(() => {
    //     if (max) setAmount(maxBalance.toString());
    // }, [max, maxBalance]);

    return (
        <form
            className={`${styles.inputContainer} ${lightMode && styles.inputContainer_light}`}
            onSubmit={handleSubmit}
        >
            {isLoadingTransaction && <Loader />}
            {isLoadingFarm && <Skeleton w={100} h={20} style={{ marginLeft: "auto" }} />}
            {!isLoadingFarm && (
                <div style={{ textAlign: "right" }}>
                    {shouldUseLp ? ` ${farm.name}` : " ETH"} Balance: &nbsp;
                    {showInUsd ? `$ ${toFixedFloor(maxBalance, 2)}` : toFixedFloor(maxBalance, 6)}
                </div>
            )}
            <div></div>

            <div className={`${styles.inputWrapper} ${lightMode && styles.inputWrapper_light}`}>
                <div style={{ display: "grid", gridTemplateColumns: "min-content 1fr", width: "100%" }}>
                    <span style={{ marginBottom: 2, opacity: showInUsd ? 1 : 0 }}>$</span>
                    <input
                        type="number"
                        placeholder="0"
                        required
                        value={noExponents(amount)}
                        max={maxBalance}
                        onChange={handleInput}
                    />
                </div>
                <div className={styles.maxContainer}>
                    <p className={styles.maxBtn} onClick={() => setMax(true)}>
                        MAX
                    </p>
                    {/* {!dontShowUsdSelect && (
                        <select
                            value={showInUsd.toString()}
                            onChange={handleShowInUsdChange}
                            className={`${styles.select} ${lightMode && styles.select_light}`}
                        >
                            <option value={"false"} className="currency_select">
                                {shouldUseLp ? farm.name : farm.zap_symbol}
                            </option>
                            <option value={"true"} className="currency_select">
                                USD
                            </option>
                        </select>
                    )} */}
                </div>
            </div>
            <button
                className={`custom-button ${lightMode && "custom-button-light"}`}
                type="submit"
                disabled={parseFloat(amount) <= 0 || isNaN(parseFloat(amount)) || isLoadingTransaction}
            >
                {!currentWallet
                    ? "Please Login"
                    : parseFloat(amount) > 0
                    ? parseFloat(amount) > maxBalance
                        ? "Insufficent Balance"
                        : type === FarmTransactionType.Deposit
                        ? "Deposit"
                        : "Withdraw"
                    : "Enter Amount"}
            </button>
        </form>
    );
};

export default DetailInput;
