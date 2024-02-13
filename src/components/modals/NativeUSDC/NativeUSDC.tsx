import React from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./NativeUSDC.module.scss";

interface IProps {
    handleClose: Function;
}

const NativeUSDC: React.FC<IProps> = ({ handleClose }) => {
    return (
        <ModalLayout onClose={handleClose} className={styles.borderClass}>
            <div className={styles.container}>
                <h1 className={styles.nativeHeading}>Native USDC</h1>
                <div></div>
                <div className={styles.inputContainer}>
                    <div className={styles.inputWrapper}>
                        <input type="text" placeholder="Enter here" required value={""} />
                    </div>
                    <button className={`custom-button ${styles.maxBtn}`}>Max</button>
                </div>
                <p className={styles.para2}>Enter the value for Native USDC balance.</p>
                <div className={styles.btnContainer}>
                    <button className={`custom-button ${styles.submitButton}`} onClick={() => handleClose()}>
                        Submit
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};

export default NativeUSDC;
