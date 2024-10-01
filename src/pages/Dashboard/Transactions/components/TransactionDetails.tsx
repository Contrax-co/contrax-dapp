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
                {tx.steps.map((step, i) => (
                    <React.Fragment key={i}>
                        {getStep(
                            step.type,
                            step.status,
                            tx.type === "deposit" ? (tx.token === zeroAddress ? 18 : 6) : 18,
                            step.amount &&
                                (tx.type === "deposit"
                                    ? step.amount
                                    : BigInt(
                                          (
                                              ((Number(formatUnits(BigInt(step.amount), 18)) * tx.vaultPrice!) /
                                                  tx.tokenPrice!) *
                                              1e18
                                          ).toFixed()
                                      )
                                ).toString(),
                            tx.token === zeroAddress ? "ETH" : "USDC"
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default TransactionDetails;

function getStep(name: string, status: TransactionStepStatus, decimals: number, value?: string, tokenName?: string) {
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
                        {Number(formatUnits(BigInt(value), decimals)).toLocaleString()} {tokenName}
                    </p>
                )}
            </div>
        </div>
    );
}
