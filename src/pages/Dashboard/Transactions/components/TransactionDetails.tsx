import React, { useEffect, useMemo, useState } from "react";
import pools_json from "src/config/constants/pools_json";
import { RootState, useAppSelector } from "src/state";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa";
import { createSelector } from "@reduxjs/toolkit";

import styles from "./TransactionDetails.module.scss";

interface IProps {
    transactionId: string;
    open: boolean;
}

const selectTransactionById = createSelector(
    (state: RootState) => state.transactions.transactions,
    (_: any, transactionId: string) => transactionId,
    (transactions, transactionId: string) => transactions.find((item) => item._id === transactionId)
);

const TransactionDetails: React.FC<IProps> = ({ transactionId, open }) => {
    const transaction = useAppSelector((state: RootState) => selectTransactionById(state, transactionId));
    const farm = useMemo(() => pools_json.find((item) => item.id === transaction?.farmId), [transaction?.farmId]);
    const [percentage, setPercentage] = useState(0);
    if (!farm) return;

    useEffect(() => {
        const int = setInterval(() => {
            setPercentage((prev) => {
                if (prev < 100) return prev + 5;
                else return 0;
            });
        }, 2000);
        return () => {
            clearInterval(int);
        };
    }, []);

    console.log("transaction =>", transaction);
    return (
        <div className={`${styles.container} ${open ? styles.open : styles.closed}`}>
            <div className={styles.loadingBarContainer}>
                <div style={{ width: `${percentage}%` }} />
            </div>
            <div style={{ marginTop: 10 }}>
                <div className={styles.row}>
                    <IoMdCheckmarkCircleOutline className={styles.icon} style={{ color: "rgb(34 197 94)" }} />
                    <div>
                        <p className={styles.stepName}>Bridge</p>
                        <p className={styles.tokenValue}>12 USDC</p>
                    </div>
                </div>
                <div className={styles.row}>
                    <MdOutlineCancel className={styles.icon} style={{ color: "red" }} />
                    <div>
                        <p className={styles.stepName}>Approve</p>
                    </div>
                    <p className={styles.retry}>Retry</p>
                </div>
                <div className={styles.row}>
                    <div className={styles.loader} />
                    <div>
                        <p className={styles.stepName}>Approve</p>
                        <p className={styles.tokenValue}>12 USDC</p>
                    </div>
                </div>
                <div className={styles.row}>
                    <FaRegCircle
                        className={styles.icon}
                        style={{ color: "var(--color_grey)", transform: "scale(0.8)" }}
                    />
                    <div>
                        <p className={styles.stepName}>Zap In</p>
                        {/* <p className={styles.tokenValue}>12 USDC</p> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetails;
