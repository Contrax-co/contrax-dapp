import { FC } from "react";
import styles from "./SlippageModal.module.scss";
import { ModalLayout } from "../ModalLayout/ModalLayout";

interface IProps {
    handleClose: Function;
    handleSubmit: Function;
    percentage: number | undefined;
}
const SlippageModal: FC<IProps> = ({ handleClose, handleSubmit, percentage }) => {
    return (
        <ModalLayout onClose={handleClose} className={styles.modal}>
            <div className={styles.container}>
                <h2 style={{ fontWeight: 600 }}>Confirm Zap</h2>
                <p style={{ color: `var(--color_grey)` }}>{`Please review the deposit process and confirm.`}</p>
                {/* <div className={styles.buttonContainer}>
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
                </div> */}
            </div>
        </ModalLayout>
    );
};

export default SlippageModal;
