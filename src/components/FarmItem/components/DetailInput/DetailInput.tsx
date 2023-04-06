import React, { useState } from "react";
import useApp from "src/hooks/useApp";
import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { noExponents } from "src/utils/common";
import styles from "./DetailInput.module.scss";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import Loader from "src/components/Loader/Loader";
import { useDetailInput } from "src/hooks/useDetailInput";
import { Select } from "src/components/Select/Select";
import { UsdToggle } from "../UsdToggle/UsdToggle";
import { useEstimateGasFee } from "src/hooks/useEstmaiteGasFee";
import useWallet from "src/hooks/useWallet";
import { constants } from "ethers";
import useFarmDetails from "src/hooks/farms/useFarmDetails";

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
        setMax,
        handleInput,
        handleSubmit,
        handleToggleShowInUsdc,
        isLoadingFarm,
        isLoadingTransaction,
    } = useDetailInput(farm);
    const { farmDetails, isLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];

    const [transactionCurrency, setTransactionCurrency] = useState("USDC");

    return (
        <form
            className={`${styles.inputContainer} ${lightMode && styles.inputContainer_light}`}
            onSubmit={handleSubmit}
        >
            {isLoadingTransaction && <Loader />}
            {isLoadingFarm && <Skeleton w={100} h={20} style={{ marginLeft: "auto" }} />}

            {!isLoadingFarm && currentWallet ? (
                <Select
                    options={
                        type === FarmTransactionType.Deposit
                            ? farmData?.Depositable_Amounts.map((_) => (showInUsd ? _.amountDollar : _.amount))
                            : farmData?.Withdrawable_Amounts.map((_) => (showInUsd ? _.amountDollar : _.amount)) || []
                    }
                    value={transactionCurrency}
                    setValue={setTransactionCurrency}
                    extraText={[": $ 823", ": $ 84", ": 83724"]}
                />
            ) : (
                <div></div>
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
                    <UsdToggle showInUsd={showInUsd} handleToggleShowInUsdc={handleToggleShowInUsdc} />
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
                    ? parseFloat(amount) > parseFloat(maxBalance)
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
