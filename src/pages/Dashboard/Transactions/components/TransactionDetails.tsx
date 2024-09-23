import React, { useEffect, useMemo, useState } from "react";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";
import pools_json from "src/config/constants/pools_json";
import { useAppSelector } from "src/state";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa";

import styles from "./TransactionDetails.module.scss";

interface IProps {
    transactionId: string;
    open: boolean;
}

const TransactionDetails: React.FC<IProps> = ({ transactionId, open }) => {
    const transaction = useAppSelector((state) =>
        state.transactions.transactions.find((item) => item._id === transactionId)
    );
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
        <div style={{ height: open ? 250 : 0 }} className={styles.container}>
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
