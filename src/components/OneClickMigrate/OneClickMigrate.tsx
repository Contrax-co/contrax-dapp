import React, { useMemo } from "react";
import styles from "./OneClickMigrate.module.scss";
import { TiWarningOutline } from "react-icons/ti";
import { customCommify } from "src/utils/common";
import { useVaults } from "src/hooks/useVaults";
import { IS_LEGACY } from "src/config/constants";
import useVaultMigrate from "src/hooks/useVaultMigrate";

interface IProps {}

const OneClickMigrate: React.FC<IProps> = () => {
    const { data, migrate, isLoading } = useVaultMigrate();

    if (data?.length !== 0)
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
                </div>
                <p className={styles.disclaimer}>
                    <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                    Migrate your funds to Contrax Smart Wallet.
                </p>
            </div>
        );
    else return null;
};

export default OneClickMigrate;
