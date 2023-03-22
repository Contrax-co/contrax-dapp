import { FC, useEffect, useState } from "react";
import useApp from "src/hooks/useApp";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import { TiWarningOutline } from "react-icons/ti";
import { BiCopy } from "react-icons/bi";
import { BsCheckCircle } from "react-icons/bs";
import styles from "./ExportPrivateKey.module.scss";
import useWallet from "src/hooks/useWallet";
import { copyToClipboard } from "src/utils";

interface IProps {
    setOpenModal: Function;
}

export const ExportPrivateKey: FC<IProps> = ({ setOpenModal }) => {
    const { lightMode } = useApp();
    const [confirm, setConfirm] = useState(false);
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);
    const [privateKey, setPrivateKey] = useState("");
    const { getPkey } = useWallet();

    useEffect(() => {
        if (!confirm) if (show) setShow(false);
    }, [confirm]);

    const handleShow = async () => {
        const pKey = await getPkey();
        setPrivateKey(pKey);
        setShow((prev) => !prev);
    };
    const copy = () => {
        setCopied(true);
        copyToClipboard(privateKey, () => setCopied(false));
    };

    return (
        <ModalLayout onClose={() => setOpenModal(false)} style={{ padding: "40px 60px 50px" }}>
            <TiWarningOutline className={styles.warning} size={1} />
            <h1 className={styles.heading}>Disclaimer</h1>
            <p className={styles.caption}>Exporting Private Key</p>
            <p className={styles.message}>
                This is for advanced users and can put their funds at risk if they export without knowing how to handle
                it
            </p>
            <div className={styles.confirm}>
                <input type="checkbox" name="confirm" id="confirm" onChange={() => setConfirm((prev) => !prev)} />
                <label htmlFor="confirm">I Understand</label>
            </div>
            <div className={styles.key}>
                {show ? (
                    <>
                        <input type="text" readOnly value={privateKey} />
                        {copied ? (
                            <BsCheckCircle className={styles.copyIcon} size={22} />
                        ) : (
                            <BiCopy className={styles.copyIcon} size={22} onClick={copy} />
                        )}
                    </>
                ) : (
                    <input type="text" readOnly value={"0xXXXXXXXXXXXXXXXXXXXXXXXXXXX"} />
                )}

                <button disabled={!confirm} className={styles.textButton} onClick={handleShow}>
                    {show ? "HIDE" : "SHOW"}
                </button>
            </div>
            <p className={styles.note}>Note: This feature is only for social wallets</p>
        </ModalLayout>
    );
};
