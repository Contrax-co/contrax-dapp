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
}

export const TransferToken: FC<IProps> = ({ token, setSelectedToken }) => {
    const { lightMode } = useApp();
    const [reciverAddress, setReciverAddress] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const { transferEth, transferToken, isLoading } = useTransfer();
    const { notifyLoading, notifyError, notifySuccess, dismissNotify } = useNotify();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const id = notifyLoading("Transferring...", "Please wait while we transfer your tokens");
        try {
            if (token.address === constants.AddressZero) {
                await transferEth({ to: reciverAddress, amount: toWei(amount.toString(), token.decimals) });
            } else {
                await transferToken({
                    tokenAddress: token.address,
                    to: reciverAddress,
                    amount: toWei(amount.toString(), token.decimals),
                });
            }
            notifySuccess("Success", "Tokens transferred successfully");
        } catch (error: any) {
            notifyError("Error", error.message);
        }
        dismissNotify(id);
        setSelectedToken(undefined);
    };

    return (
        <ModalLayout onClose={() => setSelectedToken(undefined)}>
            <form className={styles.transferForm} onSubmit={handleSubmit}>
                <h1>Transfer {token.name}</h1>
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
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                    <button type="button" className={styles.maxButton} onClick={() => setAmount(Number(token.balance))}>
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
        </ModalLayout>
    );
};
