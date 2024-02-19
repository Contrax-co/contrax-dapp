import React from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./SuccessfulEarnTrax.module.scss";

interface IProps {
    handleClose: Function;
}

const SuccessfulEarnTrax: React.FC<IProps> = ({ handleClose }) => {
    return (
        <ModalLayout onClose={handleClose} className={styles.borderClass}>
            <div className={styles.container}>
                <h1>Congratulations!</h1>
                <p className={styles.para1}>Your TRAX earning has been enabled.</p>
                <p className={styles.para2}>You can earn TRAX now on each farm with yield.</p>
                <div className={styles.btnContainer}>
                    <button className={`custom-button ${styles.okButton}`} onClick={() => handleClose()}>
                        OK!
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};

export default SuccessfulEarnTrax;
