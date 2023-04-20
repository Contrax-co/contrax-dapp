import { FC, useState } from "react";
import useApp from "src/hooks/useApp";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import { BiCopy } from "react-icons/bi";
import { BsCheckCircle } from "react-icons/bs";
import styles from "./ExportPublicKey.module.scss";
import useWallet from "src/hooks/useWallet";
import { copyToClipboard } from "src/utils";
import QRCode from "react-qr-code";

interface IProps {
    setOpenModal: Function;
}

export const ExportPublicKey: FC<IProps> = ({ setOpenModal }) => {
    const { lightMode } = useApp();
    const [copied, setCopied] = useState(false);
    const { currentWallet } = useWallet();

    const copy = () => {
        setCopied(true);
        copyToClipboard(currentWallet, () => setCopied(false));
    };

    return (
        <ModalLayout onClose={() => setOpenModal(false)} className={styles.container}>
            <div className={styles.left}>
                <div className={styles.heading}>
                    <h1>Scan Me</h1>
                </div>
                <p className={styles.caption}>Wallet Address</p>
                <div className={styles.key}>
                    <p>{`${currentWallet?.substring(0, 20)}...${currentWallet?.substring(
                        currentWallet.length - 3
                    )}`}</p>
                    {copied ? (
                        <BsCheckCircle className={styles.copyIcon} size={22} />
                    ) : (
                        <BiCopy className={styles.copyIcon} size={22} onClick={copy} />
                    )}
                </div>
                <p className={styles.extraText}>
                    Sending cryptocurrency has never been easier. Simply scan this QR code to transfer your desired
                    tokens to your contrax wallet.
                </p>
            </div>
            <div className={styles.qrCode}>
                <QRCode
                    value={currentWallet}
                    size={200}
                    bgColor={lightMode ? "#fff" : "#012243"}
                    fgColor={lightMode ? "#000" : "#fff"}
                />
            </div>
        </ModalLayout>
    );
};
