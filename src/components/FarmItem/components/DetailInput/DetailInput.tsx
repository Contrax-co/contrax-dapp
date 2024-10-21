import React, { useEffect, useMemo, useState } from "react";
import useApp from "src/hooks/useApp";
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
import { SlippageWarning } from "src/components/modals/SlippageWarning/SlippageWarning";
import { SlippageNotCalculate } from "src/components/modals/SlippageNotCalculate/SlippageNotCalculate";
import { PoolDef } from "src/config/constants/pools_json";
import useWallet from "src/hooks/useWallet";
import moment from "moment";
import useStCoreRedeem from "src/hooks/farms/useStCoreRedeem";

interface Props {
    farm: PoolDef;
}

const DetailInput: React.FC<Props> = ({ farm }) => {
    const { lightMode } = useApp();
    const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);
    const [showSlippageModal, setShowSlippageModal] = useState(false);
    const [showNotSlipageModal, setShowNotSlipageModal] = useState(false);
    const {
        amount,
        showInUsd,
        currentWallet,
        maxBalance,
        setMax,
        handleInput,
        handleSubmit,
        fetchingSlippage,
        handleToggleShowInUsdc,
        isLoadingFarm,
        slippage,
        isLoadingTransaction,
    } = useDetailInput(farm);
    const { farmDetails } = useFarmDetails();
    const { isLoading: isStCoreRedeeming, redeem } = useStCoreRedeem();
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

    const submitHandler = (e: any) => {
        e.preventDefault();
        if (slippage && slippage > 2) {
            setShowSlippageModal(true);
        } else if (slippage === undefined) {
            setShowNotSlipageModal(true);
        } else {
            handleSubmit();
        }
    };
    return (
        <form
            className={`${styles.inputContainer} ${lightMode && styles.inputContainer_light}`}
            onSubmit={submitHandler}
        >
            {isLoadingTransaction && <Loader />}
            {isLoadingFarm && <Skeleton w={100} h={20} style={{ marginLeft: "auto" }} />}

            {farm.id === 301 && transactionType === FarmTransactionType.Withdraw ? (
                <>
                    <div style={{ gridArea: "1/1/1/span 2", display: "flex", flexFlow: "column", gap: 10 }}>
                        <div
                            style={{
                                display: "flex",
                                // flexFlow: "column",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <p>
                                Redeemable:{" "}
                                {Number(
                                    farmDetails?.[farm.id]?.withdrawableAmounts[1].amountDollar || 0
                                ).toLocaleString()}
                                $
                            </p>
                            <button
                                disabled={isStCoreRedeeming}
                                className={`custom-button ${lightMode && "custom-button-light"}`}
                                style={{ width: 100, height: 40, minHeight: 0, padding: 0, minWidth: 0 }}
                                onClick={() => redeem()}
                                type="button"
                            >
                                Redeem
                            </button>
                        </div>
                        <p>Redeem Records</p>
                        <div>
                            {farmDetails?.[farm.id]?.extraData?.redeemRecords.map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        background: "var(--background_light)",
                                        padding: "2px 10px",
                                        borderRadius: 4,
                                        marginBottom: 5,
                                    }}
                                >
                                    <p>$ {item.amountDollar.toLocaleString()}</p>
                                    <p>Unlocks At {moment(Number(item.unlockTime) * 1000).calendar()}</p>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                background: "var(--background_light)",
                                padding: "20px 20px",

                                borderRadius: 4,
                                marginBottom: 5,
                            }}
                        >
                            <p>Total Unlock Amount</p>
                            <p>$ {farmDetails?.[farm.id]?.extraData?.unlockAmountDollar.toLocaleString()}</p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexFlow: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                            }}
                        >
                            <button
                                disabled={farmDetails?.[farm.id]?.extraData?.unlockAmountDollar === 0}
                                className={`custom-button ${lightMode && "custom-button-light"}`}
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
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
                        disabled={
                            parseFloat(amount) <= 0 ||
                            isNaN(parseFloat(amount)) ||
                            isLoadingTransaction ||
                            fetchingSlippage
                        }
                    >
                        {!currentWallet
                            ? "Please Login"
                            : parseFloat(amount) > 0
                            ? parseFloat(amount) > parseFloat(maxBalance)
                                ? "Insufficent Balance"
                                : fetchingSlippage
                                ? "Simulating..."
                                : transactionType === FarmTransactionType.Deposit
                                ? "Deposit"
                                : "Withdraw"
                            : "Enter Amount"}
                    </button>
                </>
            )}

            <div style={{ justifyContent: "flex-start" }} className="center">
                <p className={styles.slippage}>Slippage: &nbsp;</p>
                <p className={styles.slippage}>
                    {fetchingSlippage ? (
                        <Skeleton w={50} h={20} style={{}} />
                    ) : (
                        `~${slippage?.toString() && !isNaN(slippage) ? slippage?.toFixed(2) : "- "}%`
                    )}
                </p>
            </div>
            {showSlippageModal && (
                <SlippageWarning
                    handleClose={() => {
                        setShowSlippageModal(false);
                    }}
                    handleSubmit={handleSubmit}
                    percentage={slippage || 0}
                />
            )}
            {showNotSlipageModal && (
                <SlippageNotCalculate
                    handleClose={() => {
                        setShowNotSlipageModal(false);
                    }}
                    handleSubmit={handleSubmit}
                />
            )}
        </form>
    );
};

export default DetailInput;
