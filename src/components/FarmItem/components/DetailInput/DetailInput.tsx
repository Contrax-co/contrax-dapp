import React, { useMemo } from "react";
import useApp from "src/hooks/useApp";
import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { noExponents } from "src/utils/common";
import styles from "./DetailInput.module.scss";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import Loader from "src/components/Loader/Loader";
import { useDetailInput } from "src/hooks/useDetailInput";
import { Select } from "src/components/Select/Select";
import { UsdToggle } from "../../../UsdToggle/UsdToggle";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import { useAppDispatch, useAppSelector } from "src/state";
import { setFarmDetailInputOptions } from "src/state/farms/farmsReducer";
import { FarmDetailInputOptions } from "src/state/farms/types";

interface Props {
    farm: Farm;
}

const DetailInput: React.FC<Props> = ({ farm }) => {
    const { lightMode } = useApp();
    const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);

    const {
        amount,
        showInUsd,
        currentWallet,
        maxBalance,
        setMax,
        handleInput,
        handleSubmit,
        handleToggleShowInUsdc,
        isLoadingFarm,
        slippage,
        isLoadingTransaction,
    } = useDetailInput(farm);
    const { farmDetails } = useFarmDetails();
    const farmData = farmDetails[farm.id];

    const dispatch = useAppDispatch();

    const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
        dispatch(setFarmDetailInputOptions(opt));
    };

    const selectOptions = useMemo(
        () =>
            transactionType === FarmTransactionType.Deposit
                ? farmData?.depositableAmounts.map((_) => _.tokenSymbol)
                : farmData?.withdrawableAmounts.map((_) => _.tokenSymbol) || [],
        [transactionType, farmData]
    );

    const selectExtraOptions = useMemo(
        () =>
            transactionType === FarmTransactionType.Deposit
                ? farmData?.depositableAmounts.map(
                      (_) =>
                          (showInUsd ? ": $" : ": ") +
                          Number(showInUsd ? _.amountDollar : _.amount).toLocaleString("en-us", {
                              maximumFractionDigits: 4,
                          })
                  )
                : farmData?.withdrawableAmounts.map(
                      (_) =>
                          (showInUsd ? ": $" : ": ") +
                          Number(showInUsd ? _.amountDollar : _.amount).toLocaleString("en-us", {
                              maximumFractionDigits: 4,
                          })
                  ) || [],
        [transactionType, farmData, showInUsd]
    );

    return (
        <form
            className={`${styles.inputContainer} ${lightMode && styles.inputContainer_light}`}
            onSubmit={handleSubmit}
        >
            {isLoadingTransaction && <Loader />}
            {isLoadingFarm && <Skeleton w={100} h={20} style={{ marginLeft: "auto" }} />}

            {!isLoadingFarm && currentWallet ? (
                <Select
                    options={selectOptions}
                    value={currencySymbol}
                    setValue={(val) => setFarmOptions({ currencySymbol: val })}
                    extraText={selectExtraOptions}
                />
            ) : (
                <div></div>
            )}
            <div></div>

            <div className={styles.inputWrapper}>
                <input
                    type="number"
                    placeholder="0"
                    required
                    value={noExponents(amount)}
                    max={maxBalance}
                    onChange={handleInput}
                />
                <div className={styles.maxContainer}>
                    <p className={styles.maxBtn} onClick={() => setMax(true)}>
                        MAX
                    </p>
                    <UsdToggle showInUsd={showInUsd} handleToggleShowInUsdc={handleToggleShowInUsdc} />
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
                        : transactionType === FarmTransactionType.Deposit
                        ? "Deposit"
                        : "Withdraw"
                    : "Enter Amount"}
            </button>
            <p className={styles.slippage}>{slippage && !isNaN(slippage) && `Slippage: ${slippage.toFixed(2)}%`}</p>
        </form>
    );
};

export default DetailInput;
