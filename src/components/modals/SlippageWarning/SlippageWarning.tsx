import { FC } from "react";
import useApp from "src/hooks/useApp";
import styles from "./SlippageWarning.module.scss";
import { ModalLayout } from "../ModalLayout/ModalLayout";

interface IProps {
    handleClose: Function;
    handleSubmit: Function;
    percentage: number | undefined;
}
export const SlippageWarning: FC<IProps> = ({ handleClose, handleSubmit, percentage }) => {
    return (
        <ModalLayout onClose={handleClose} className={styles.modal}>
            <div className={styles.container}>
                <h1>Warning</h1>
                <p className={styles.warningText}>{`Slipage is higher than normal at ${percentage?.toFixed(2)}%.`}</p>
                <p className={styles.warningText}>Are you sure you still want to continue?</p>
                <div className={styles.buttonContainer}>
                    <button
                        className={`custom-button ${styles.cancelButton}`}
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        Close
                    </button>
                    <button
                        className={`custom-button ${styles.continueButton}`}
                        onClick={() => {
                            handleSubmit();
                            handleClose();
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};
