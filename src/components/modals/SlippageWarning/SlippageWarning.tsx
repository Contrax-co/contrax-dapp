import { FC } from "react";
import styles from "./SlippageWarning.module.scss";
import { ModalLayout } from "../ModalLayout/ModalLayout";

interface IProps {
    handleClose: Function;
    percentage: number | undefined;
}
export const SlippageWarning: FC<IProps> = ({ handleClose, percentage }) => {
    return (
        <ModalLayout onClose={handleClose}>
            <div className={styles.container}>
                <h1>Warning</h1>
                <p className={styles.warningText}>{`Slipage is higher than normal at ${percentage}%.`}</p>
                <p className={styles.warningText}>Are you sure you still want to continue?</p>
                <div className={styles.buttonContainer}>
                    <button className={`custom-button ${styles.continueButton}`} onClick={() => handleClose()}>
                        Close
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};
