import { FC, useEffect, useState } from "react";
import useApp from "src/hooks/useApp";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import { TiWarningOutline } from "react-icons/ti";
import { BiCopy } from "react-icons/bi";
import { BsCheckCircle } from "react-icons/bs";
import styles from "./SettingsModal.module.scss";
import useWallet from "src/hooks/useWallet";
import { copyToClipboard } from "src/utils";

interface IProps {
    setOpenModal: Function;
}

export const SettingsModal: FC<IProps> = ({ setOpenModal }) => {
    const { lightMode } = useApp();
    const [confirm, setConfirm] = useState(false);
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);
    const [privateKey, setPrivateKey] = useState("");
    const { getPkey, currentWallet } = useWallet();

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
        <ModalLayout onClose={() => setOpenModal(false)}>
            <div className={styles.heading}>
                <TiWarningOutline size={40} />
                <h1>Disclaimer</h1>
            </div>
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
                        {/* <p>{privateKey}</p> */}
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

                <button className={styles.showButton} disabled={!confirm} onClick={handleShow}>
                    {show ? "HIDE" : "SHOW"}
                </button>
            </div>
        </ModalLayout>
    );
};
