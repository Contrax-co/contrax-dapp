import React from "react";
import styles from "./OneClickMigrate.module.scss";
import { TiWarningOutline } from "react-icons/ti";
import useVaultMigrate from "src/hooks/useVaultMigrate";
import { AiOutlineDisconnect } from "react-icons/ai";

interface IProps {}

const OneClickMigrate: React.FC<IProps> = () => {
    const { migrate, isLoading, disconnect } = useVaultMigrate();

    return (
        <div className={`outlinedContainer ${styles.container}`}>
            <p style={{ textAlign: "center" }}></p>
            <div className={styles.btnContainer}>
                <button
                    className={`custom-button ${styles.bridgeButton}`}
                    disabled={isLoading}
                    onClick={() => migrate()}
                >
                    Migrate
                </button>
                <button
                    className={`custom-button ${styles.bridgeButton}`}
                    disabled={isLoading}
                    onClick={() => disconnect()}
                    data-tooltip-content="Disconnect if connected previously"
                >
                    <AiOutlineDisconnect />
                </button>
            </div>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                If you previously had funds in your old social wallet, you can migrate those from here.
            </p>
        </div>
    );
};

export default OneClickMigrate;
