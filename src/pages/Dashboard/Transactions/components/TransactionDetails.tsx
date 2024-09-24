import React, { useEffect, useMemo, useState } from "react";
import pools_json from "src/config/constants/pools_json";
import { RootState, useAppSelector } from "src/state";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa";
import { createSelector } from "@reduxjs/toolkit";

import styles from "./TransactionDetails.module.scss";
import { TransactionStepStatus } from "src/state/transactions/types";
import { zeroAddress } from "viem";

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
    if (!farm || !transaction) return;

    return (
        <div className={`${styles.container} ${open ? styles.open : styles.closed}`}>
            <div className={styles.loadingBarContainer}>
                <div  />
            </div>
            <div style={{ marginTop: 10 }}>
                {transaction.steps.map((step) =>
                    getStep(step.name, step.status, step.amount, transaction.token === zeroAddress ? "ETH" : "USDC")
                )}
            </div>
        </div>
    );
};

export default TransactionDetails;

function getStep(name: string, status: TransactionStepStatus, value?: string, tokenName?: string) {
    return (
        <div className={styles.row}>
            {status === TransactionStepStatus.COMPLETED ? (
                <IoMdCheckmarkCircleOutline className={styles.icon} style={{ color: "rgb(34 197 94)" }} />
            ) : status === TransactionStepStatus.FAILED ? (
                <MdOutlineCancel className={styles.icon} style={{ color: "red" }} />
            ) : status === TransactionStepStatus.PENDING ? (
                <FaRegCircle className={styles.icon} style={{ color: "var(--color_grey)", transform: "scale(0.8)" }} />
            ) : (
                <div className={styles.loader} />
            )}
            <div>
                <p className={styles.stepName}>{name}</p>
                {value && (
                    <p className={styles.tokenValue}>
                        {value} {tokenName}
                    </p>
                )}
            </div>
        </div>
    );
}
