import { FC, FormEvent, useState } from "react";
import useApp from "src/hooks/useApp";
import { Token } from "src/types";
import styles from "./TransferToken.module.scss";

interface IProps {
    token: Token;
    setSelectedToken: Function;
}

export const TransferToken: FC<IProps> = ({ token, setSelectedToken }) => {
    const { lightMode } = useApp();
    const [reciverAddress, setReciverAddress] = useState<string>();
    const [amount, setAmount] = useState<number>();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSelectedToken(undefined);
    };

    return (
        <div className={styles.backdrop} onClick={() => setSelectedToken(undefined)}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <form className={styles.transferForm} onClick={handleSubmit}>
                    <h1 className={styles.heading}>Transfer {token.name}</h1>
                    <div className="token-rows token-column">
                        <label htmlFor="reciverAddress" className="token-label">
                            Send To:
                        </label>
                        <input
                            className={`token-inputs ${lightMode && "token-inputs-light"}`}
                            type="text"
                            id="reciverAddress"
                            placeholder="Reciver Address"
                            value={reciverAddress}
                            onChange={(e) => setReciverAddress(e.target.value)}
                        />
                    </div>
                    <div className="token-rows token-column">
                        <label htmlFor="amount" className="token-label">
                            Amount:
                        </label>
                        <input
                            className={`token-inputs ${lightMode && "token-inputs-light"}`}
                            type="number"
                            id="amount"
                            placeholder="e.g. 250"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Transfer
                    </button>
                </form>
            </div>
        </div>
    );
};
