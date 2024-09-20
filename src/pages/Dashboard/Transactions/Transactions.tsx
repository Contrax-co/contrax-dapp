import React, { FC, useMemo, useState } from "react";
import styles from "./Transactions.module.scss";
import { IoArrowUpOutline } from "react-icons/io5";
import { IoArrowDownOutline } from "react-icons/io5";
import farms from "src/config/constants/pools_json";
import moment from "moment";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";
import { useAppSelector } from "src/state";
import { Transaction, TransactionStatus } from "src/state/transactions/types";
import { formatUnits, zeroAddress } from "viem";
import { useDecimals } from "src/hooks/useDecimals";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { VscError } from "react-icons/vsc";
// import { FaInfo } from "react-icons/fa";
import { FaInfo } from "react-icons/fa6";

const Transactions = () => {
    const [open, setOpen] = useState(false);
    const transactions = useAppSelector((state) => state.transactions.transactions.slice(0, 3));

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
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

const Row: FC<Transaction> = ({
    amountInWei,
    date,
    farmId,
    tokenPrice,
    vaultPrice,
    _id,
    max,
    status,
    token,
    type,
    bridgeInfo,
    txHash,
}) => {
    const farm = useMemo(() => farms.find((item) => item.id === farmId), [farmId]);
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

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
    return (
        <div className={styles.row}>
            <div className={styles.txTypeArrowWrapper} style={{ color: type === "deposit" ? "green" : "red" }}>
                {type === "deposit" && status === TransactionStatus.SUCCESS && (
                    <IoArrowDownOutline style={{ width: 24, height: 24 }} />
                )}
                {type === "withdraw" && status === TransactionStatus.SUCCESS && (
                    <IoArrowUpOutline style={{ width: 24, height: 24 }} />
                )}
                {status === TransactionStatus.FAILED && <VscError style={{ width: 24, height: 24 }} />}
                {(status === TransactionStatus.PENDING || status === TransactionStatus.BRIDGING) && (
                    <div className={styles.loader} />
                )}
                {status === TransactionStatus.INTERRUPTED && (
                    <FaInfo style={{ width: 24, height: 24, color: "black" }} />
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
        </div>
    );
};

const TransactionsModal: FC<{ setOpenModal: (value: boolean) => void }> = ({ setOpenModal }) => {
    const transactions = useAppSelector((state) => state.transactions.transactions);

    return (
        <ModalLayout
            onClose={() => setOpenModal(false)}
            className={styles.modalContainer}
            onScroll={(e) => {
                console.log(e.target);
            }}
        >
            <p className={`${styles.section_title}`}>Transactions</p>
            <div className={styles.rowsContainer}>
                {transactions.map((item, i) => (
                    <Row {...item} key={i} />
                ))}
            </div>
        </ModalLayout>
    );
};
