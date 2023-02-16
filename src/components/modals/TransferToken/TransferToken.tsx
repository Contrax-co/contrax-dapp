import { FC, FormEvent, useState } from "react";
import useApp from "src/hooks/useApp";
import useTransfer from "src/hooks/useTransfer";
import { Token } from "src/types";
import styles from "./TransferToken.module.scss";
import { constants } from "ethers";
import useNotify from "src/hooks/useNotify";
import { toWei } from "src/utils/common";
import { ModalLayout } from "../ModalLayout/ModalLayout";

interface IProps {
    token: Token;
    setSelectedToken: Function;
    refetchBalances: Function;
}

export const TransferToken: FC<IProps> = ({ token, setSelectedToken, refetchBalances }) => {
    const { lightMode } = useApp();
    const [reciverAddress, setReciverAddress] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const { transferEth, transferToken, isLoading } = useTransfer();
    const { notifyLoading, notifyError, notifySuccess, dismissNotify } = useNotify();
    const [max, setMax] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const id = notifyLoading("Transferring...", "Please wait while we transfer your tokens");
        try {
            if (token.address === constants.AddressZero) {
                await transferEth({ to: reciverAddress, amount: toWei(amount.toString(), token.decimals), max });
            } else {
                await transferToken({
                    tokenAddress: token.address,
                    to: reciverAddress,
                    amount: toWei(amount.toString(), token.decimals),
                    max,
                });
            }
            notifySuccess("Success", "Tokens transferred successfully");
        } catch (error: any) {
            let err = JSON.parse(JSON.stringify(error));
            notifyError("Error!", err.reason || err.message);
        }
        dismissNotify(id);
        setSelectedToken(undefined);
        refetchBalances();
    };

    const handleMaxClick = () => {
        setMax(true);
        setAmount(Number(token.balance));
    };

    return (
        <div className={styles.backdrop} onClick={() => setSelectedToken(undefined)}>
            <div
                className={`${styles.container} ${lightMode && styles.container_light}`}
                onClick={(e) => e.stopPropagation()}
            >
                <form className={styles.transferForm} onSubmit={handleSubmit}>
                    <h1 className={styles.heading}>Transfer {token.name}</h1>
                    <div className={styles.row}>
                        <label htmlFor="reciverAddress" className={styles.label}>
                            Send To:
                        </label>
                        <input
                            className={`${styles.inputs} ${lightMode && styles.inputs_light}`}
                            type="text"
                            id="reciverAddress"
                            placeholder="Reciver Address"
                            value={reciverAddress}
                            onChange={(e) => setReciverAddress(e.target.value)}
                        />
                    </div>
                    <div className={styles.row}>
                        <label htmlFor="amount" className={styles.label}>
                            Amount:
                        </label>
                        <input
                            className={`${styles.inputs} ${lightMode && styles.inputs_light}`}
                            type="number"
                            id="amount"
                            placeholder="e.g. 250"
                            value={amount}
                            onChange={(e) => {
                                setAmount(Number(e.target.value));
                                setMax(false);
                            }}
                        />
                        <button type="button" className={styles.maxButton} onClick={handleMaxClick}>
                            MAX
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || amount <= 0 || !reciverAddress}
                        className={`${styles.button} ${lightMode && styles.button_light}`}
                    >
                        Transfer
                    </button>
                </form>
            </div>
        </div>
    );
};
