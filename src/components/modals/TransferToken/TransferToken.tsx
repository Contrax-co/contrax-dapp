import { FC, FormEvent, useState } from "react";
import useApp from "src/hooks/useApp";
import useTransfer from "src/hooks/useTransfer";
import { Token } from "src/types";
import styles from "./TransferToken.module.scss";
import { constants } from "ethers";
import { noExponents, toWei } from "src/utils/common";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import useBalances from "src/hooks/useBalances";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import { useEstimateGasFee } from "src/hooks/useEstmaiteGasFee";

interface IProps {
    token: Token;
    setSelectedToken: Function;
}

export const TransferToken: FC<IProps> = ({ token, setSelectedToken }) => {
    const { reloadBalances } = useBalances();
    const { lightMode } = useApp();
    const [reciverAddress, setReciverAddress] = useState<string>("");
    const [amount, setAmount] = useState("0");
    const { transferEth, transferToken, isLoading } = useTransfer();
    const [max, setMax] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // check for eth balance greater than gas fee
        const id = notifyLoading(loadingMessages.transferingTokens());
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
            notifySuccess(successMessages.tokenTransfered());
        } catch (error: any) {
            let err = JSON.parse(JSON.stringify(error));
            notifyError(errorMessages.generalError(err.cause?.reason || err.reason || err.message));
        }
        dismissNotify(id);
        setSelectedToken(undefined);
        reloadBalances();
    };

    const handleMaxClick = () => {
        setMax(true);
        setAmount(token.balance);
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
                        Amount: <span style={{ fontSize: 14 }}>(Balance: {token.balance})</span>
                    </label>
                    <input
                        className={`${styles.inputs} ${lightMode && styles.inputs_light}`}
                        type="number"
                        id="amount"
                        placeholder="e.g. 250"
                        value={amount ? noExponents(amount) : undefined}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setMax(false);
                        }}
                    />
                    <button type="button" className={styles.maxButton} onClick={handleMaxClick}>
                        MAX
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={isLoading || Number(amount) <= 0 || !reciverAddress}
                    className={`${styles.button} ${lightMode && styles.button_light}`}
                >
                    Transfer
                </button>
            </form>
        </ModalLayout>
    );
};
