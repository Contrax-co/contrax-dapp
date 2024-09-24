import React, { FC, useMemo, useRef, useState } from "react";
import styles from "./Transactions.module.scss";
import { IoArrowUpOutline } from "react-icons/io5";
import { IoArrowDownOutline } from "react-icons/io5";
import farms from "src/config/constants/pools_json";
import moment from "moment";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";
import { useAppSelector } from "src/state";
import { Transaction, TransactionStatus, TransactionStepStatus } from "src/state/transactions/types";
import { formatUnits, zeroAddress } from "viem";
import { useDecimals } from "src/hooks/useDecimals";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { VscError } from "react-icons/vsc";
// import { FaInfo } from "react-icons/fa";
import { FaInfo } from "react-icons/fa6";
import useTransactions from "src/hooks/useTransactions";
import TransactionDetails from "./components/TransactionDetails";
import { IoChevronUpOutline } from "react-icons/io5";
import { IoChevronDownOutline } from "react-icons/io5";

const Transactions = () => {
    const [open, setOpen] = useState(false);
    const transactions = useAppSelector((state) => state.transactions.transactions.slice(0, 3));

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <p className={`${styles.section_title}`}>Transactions</p>
                <p style={{ cursor: "pointer" }} onClick={() => setOpen(true)}>
                    See all
                </p>
            </div>
            <div className={styles.rowsContainer}>
                {transactions.length === 0 && <p className="center">No transactions yet</p>}
                {transactions.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
            </div>
            {open && <TransactionsModal setOpenModal={setOpen} />}
        </div>
    );
};

export default Transactions;

const Row: FC<Transaction> = ({ amountInWei, date, farmId, tokenPrice, vaultPrice, _id, max, token, type, steps }) => {
    const farm = useMemo(() => farms.find((item) => item.id === farmId), [farmId]);
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();
    const [open, setOpen] = useState(false);

    if (!farm) return null;

    let tokenAmount = 0;
    if (type === "deposit") {
        tokenAmount = Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][token]));
    } else {
        tokenAmount =
            (Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][farm.vault_addr])) *
                (vaultPrice || prices[farm.chainId][farm.vault_addr])) /
            (tokenPrice || prices[farm.chainId][token]);
    }
    const status = useMemo(() => {
        if (steps.every((step) => step.status === TransactionStepStatus.COMPLETED)) return TransactionStatus.SUCCESS;
        if (steps.some((step) => step.status === TransactionStepStatus.FAILED)) return TransactionStatus.FAILED;
        if (steps.some((step) => step.status === TransactionStepStatus.IN_PROGRESS)) return TransactionStatus.PENDING;
        return TransactionStatus.INTERRUPTED;
    }, [steps]);

    return (
        <>
            <div className={styles.rowWrapper}>
                <div className={styles.row} onClick={() => setOpen(!open)}>
                    <div className={styles.txTypeArrowWrapper}>
                        {type === "deposit" && status === TransactionStatus.SUCCESS && (
                            <IoArrowDownOutline style={{ width: 24, height: 24, color: "green" }} />
                        )}
                        {type === "withdraw" && status === TransactionStatus.SUCCESS && (
                            <IoArrowUpOutline style={{ width: 24, height: 24, color: "red" }} />
                        )}
                        {status === TransactionStatus.FAILED && (
                            <VscError style={{ width: 24, height: 24, color: "red" }} />
                        )}
                        {status === TransactionStatus.PENDING && <div className={styles.loader} />}
                        {status === TransactionStatus.INTERRUPTED && (
                            <FaInfo style={{ width: 24, height: 24, color: "var(--color_text)" }} />
                        )}
                        <img
                            className={styles.networkLogo}
                            src={`https://github.com/Contrax-co/tokens/blob/main/chains/${farm.chainId}.png?raw=true`}
                            alt={farm.chainId.toString()}
                        />
                    </div>
                    <div className={styles.txDetailsFarm}>
                        <p className={styles.farmName}>{farm.name}</p>
                        <p className={styles.date}>{moment(date).fromNow()}</p>
                    </div>
                    <div className={styles.txAmountDetails}>
                        <p className={styles.farmName}>
                            $
                            {(
                                Number(
                                    formatUnits(
                                        BigInt(amountInWei),
                                        decimals[farm.chainId][type === "withdraw" ? farm.vault_addr : token]
                                    )
                                ) *
                                (type === "withdraw"
                                    ? vaultPrice || prices[farm.chainId][farm.vault_addr]
                                    : (tokenPrice || prices[farm.chainId][token])!)
                            ).toLocaleString()}
                        </p>
                        <p className={styles.date}>
                            {tokenAmount.toLocaleString()} {token === zeroAddress ? "ETH" : "USDC"}
                        </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {open ? (
                            <IoChevronUpOutline style={{ width: 20, height: 20 }} />
                        ) : (
                            <IoChevronDownOutline style={{ width: 20, height: 20 }} />
                        )}
                    </div>
                </div>
                <TransactionDetails transactionId={_id} open={open} />
            </div>
        </>
    );
};

const TransactionsModal: FC<{ setOpenModal: (value: boolean) => void }> = ({ setOpenModal }) => {
    const transactions = useAppSelector((state) => state.transactions.transactions);
    const { fetchTransactions, isLoading, fetchedAll } = useTransactions();
    const timeout = useRef<NodeJS.Timeout>();

    return (
        <ModalLayout
            onClose={() => setOpenModal(false)}
            className={styles.modalContainer}
            onWheel={(e) => {
                if (fetchedAll) return;
                let ele: Element = e.currentTarget as Element;
                let percent = (ele.scrollTop / (ele.scrollHeight - ele.clientHeight)) * 100;
                if (percent === 100 && !isLoading) {
                    clearTimeout(timeout.current);
                    timeout.current = setTimeout(() => {
                        fetchTransactions();
                    }, 1000);
                }
            }}
        >
            <p className={`${styles.section_title}`}>Transactions</p>
            <div className={styles.rowsContainer}>
                {transactions.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {/* {transactions.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {transactions.map((item, i) => (
                    <Row {...item} key={i} />
                ))} */}
                {isLoading && (
                    <div className="center">
                        <div className={styles.loader} />
                    </div>
                )}
            </div>
        </ModalLayout>
    );
};
