import { FC } from "react";
import styles from "./SlippageNotCalculate.module.scss";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import errorIcon from "../../../assets/images/Error.png";

interface IProps {
    handleClose: Function;
    handleSubmit: Function;
}
export const SlippageNotCalculate: FC<IProps> = ({ handleClose, handleSubmit }) => {
    return (
        <ModalLayout onClose={handleClose} className={styles.modal}>
            <div className={styles.container}>
                <img src={errorIcon} alt="error" />
                <p className={styles.warningText}>
                    Transaction slippage could not be simulated. <br />
                    Your total fees are not confirmed.
                </p>
                <p className={styles.StillText}>Do you still wish to continue?</p>
                <div className={styles.buttonContainer}>
                    <button
                        className={`custom-button ${styles.cancelButton}`}
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        Cancel
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
