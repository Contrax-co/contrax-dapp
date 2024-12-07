import React from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa";

import styles from "./TransactionDetails.module.scss";
import { TransactionStepStatus } from "src/state/transactions/types";
import { formatUnits, zeroAddress } from "viem";
import useTransaction from "src/hooks/useTransaction";

interface IProps {
    transactionId: string;
    open: boolean;
}

const TransactionDetails: React.FC<IProps> = ({ transactionId, open }) => {
    const { tx, farm } = useTransaction(transactionId);
    if (!farm || !tx) return;

    return (
        <div className={`${styles.container} ${open ? styles.open : styles.closed}`}>
            <div className={styles.loadingBarContainer}>
                <div
                    className={
                        tx.steps.some((item) => item.status === TransactionStepStatus.IN_PROGRESS)
                            ? styles.loadingBarAnimated
                            : ""
                    }
                />
            </div>
            <div style={{ marginTop: 10 }}>
                {tx.steps.map((step, i) => {
                    const decimals = tx.type === "deposit" ? (tx.token === zeroAddress ? 18 : 6) : 18;
                    const amount = Number(formatUnits(BigInt(step.amount ?? 0), decimals));
                    const amountInUsd = (amount * tx.vaultPrice!) / tx.tokenPrice!;
                    return (
                        <React.Fragment key={i}>
                            {getStep(
                                step.type,
                                step.status,
                                tx.type === "deposit" ? amount : amountInUsd,
                                tx.token === zeroAddress ? "ETH" : "USDC"
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionDetails;

function getStep(name: string, status: TransactionStepStatus, value: number, tokenName?: string) {
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
                        {value.toLocaleString()} {tokenName}
                    </p>
                )}
            </div>
        </div>
    );
}
