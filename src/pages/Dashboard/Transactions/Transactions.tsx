import React, { FC, useMemo, useState } from "react";
import styles from "./Transactions.module.scss";
import { IoArrowUpOutline } from "react-icons/io5";
import { IoArrowDownOutline } from "react-icons/io5";
import farms from "src/config/constants/pools_json";
import moment from "moment";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";

type Tx = {
    type: "in" | "out" | "pending";
    amountUsd: number;
    amount: number;
    tokenSymbol: string;
    date: string;
    chainId: number;
    farmId: number;
};

const txs: Tx[] = [
    {
        type: "pending",
        amountUsd: 2,
        amount: 3,
        tokenSymbol: "USDC",
        date: new Date().toString(),
        chainId: 42161,
        farmId: 16,
    },
    {
        type: "out",
        amountUsd: 2,
        amount: 3,
        tokenSymbol: "USDC",
        date: new Date().toString(),
        chainId: 42161,
        farmId: 40,
    },
    {
        type: "in",
        amountUsd: 2,
        amount: 3,
        tokenSymbol: "USDC",
        date: new Date().toString(),
        chainId: 42161,
        farmId: 19,
    },
];

const Transactions = () => {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <p className={`${styles.section_title}`}>Transactions</p>
                <p style={{ cursor: "pointer" }} onClick={() => setOpen(true)}>
                    See all
                </p>
            </div>
            <div className={styles.rowsContainer}>
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
            </div>
            {open && <TransactionsModal setOpenModal={setOpen} />}
        </div>
    );
};

export default Transactions;

const Row: FC<Tx> = ({ amount, amountUsd, chainId, date, farmId, tokenSymbol, type }) => {
    const farm = useMemo(() => farms.find((item) => item.id === farmId), [farmId]);
    if (!farm) return null;
    return (
        <div className={styles.row}>
            <div className={styles.txTypeArrowWrapper}>
                {type === "in" && <IoArrowDownOutline style={{ width: 24, height: 24 }} />}
                {type === "out" && <IoArrowUpOutline style={{ width: 24, height: 24 }} />}
                {type === "pending" && <div className={styles.loader} />}
                <img
                    className={styles.networkLogo}
                    src={`https://github.com/Contrax-co/tokens/blob/main/chains/${chainId}.png?raw=true`}
                    alt={chainId.toString()}
                />
            </div>
            <div className={styles.txDetailsFarm}>
                <p className={styles.farmName}>{farm.name}</p>
                <p className={styles.date}>{moment(date).fromNow()}</p>
            </div>
            <div className={styles.txAmountDetails}>
                <p className={styles.farmName}>${amountUsd}</p>
                <p className={styles.date}>
                    {amount} {tokenSymbol}
                </p>
            </div>
        </div>
    );
};

const TransactionsModal: FC<{ setOpenModal: (value: boolean) => void }> = ({ setOpenModal }) => {
    return (
        <ModalLayout onClose={() => setOpenModal(false)} className={styles.modalContainer}>
            <p className={`${styles.section_title}`}>Transactions</p>
            <div className={styles.rowsContainer}>
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
                {txs.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
            </div>
        </ModalLayout>
    );
};
