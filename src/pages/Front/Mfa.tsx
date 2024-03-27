import React from "react";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";
import styles from "./Front.module.scss";

interface Props {
    setMfa: (value: string) => void;
    loading?: boolean;
    handleTransfer: () => void;
}

const Mfa: React.FC<Props> = ({ setMfa, loading, handleTransfer }) => {
    return (
        <ModalLayout onClose={() => setMfa("")}>
            <h6>Enter MFA</h6>
            <input className={styles.inputWrapper} type="password" required onChange={(e) => setMfa(e.target.value)} />
            <button
                onClick={() => handleTransfer()}
                className="custom-button"
                disabled={loading}
                style={{ marginTop: 20 }}
            >
                Transfer
            </button>
        </ModalLayout>
    );
};

export default Mfa;
