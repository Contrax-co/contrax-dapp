import { FC } from "react";
import useApp from "src/hooks/useApp";
import { Token } from "src/types";
import styles from "./TransferToken.module.scss";
import { noExponents } from "src/utils/common";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import { UsdToggle } from "src/components/UsdToggle/UsdToggle";
import { useTransferToken } from "src/hooks/useTransferToken";

interface IProps {
    token: Token;
    handleClose: Function;
}

export const TransferToken: FC<IProps> = ({ token, handleClose }) => {
    const { lightMode } = useApp();

    const {
        isLoading,
        showInUsd,
        amount,
        setAmount,
        setMax,
        handleSubmit,
        handleMaxClick,
        handleToggleShowInUsdc,
        receiverAddress,
        setReceiverAddress,
    } = useTransferToken(token, handleClose);

    return (
        <ModalLayout onClose={handleClose}>
            <form className={styles.transferForm} onSubmit={handleSubmit}>
                <h1>Transfer {token.name}</h1>
                <div className={styles.row}>
                    <label htmlFor="reciverAddress" className={styles.label}>
                        Send To:
                    </label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            id="reciverAddress"
                            placeholder="Reciver Address"
                            required
                            value={receiverAddress}
                            onChange={(e) => setReceiverAddress(e.target.value)}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <label htmlFor="amount" className={styles.label}>
                        Amount:{" "}
                        <span style={{ fontSize: 14 }}>
                            (Balance: {showInUsd ? `$${token.usdBalance}` : token.balance})
                        </span>
                    </label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="amount"
                            type="number"
                            placeholder="e.g. 250"
                            required
                            value={amount ? noExponents(amount) : ""}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setMax(false);
                            }}
                        />
                        <div className={styles.maxContainer}>
                            <p className={styles.maxBtn} onClick={handleMaxClick}>
                                MAX
                            </p>
                            <UsdToggle showInUsd={showInUsd} handleToggleShowInUsdc={handleToggleShowInUsdc} />
                        </div>
                    </div>
                </div>
                <button
                    className={`custom-button ${lightMode && "custom-button-light"} ${styles.button}`}
                    type="submit"
                    disabled={
                        isLoading ||
                        Number(amount) <= 0 ||
                        !receiverAddress ||
                        (showInUsd ? Number(amount) > Number(token.usdBalance) : Number(amount) > Number(token.balance))
                    }
                >
                    {(showInUsd ? Number(amount) > Number(token.usdBalance) : Number(amount) > Number(token.balance))
                        ? "Insufficent Fund"
                        : "Transfer"}
                </button>
            </form>
        </ModalLayout>
    );
};
