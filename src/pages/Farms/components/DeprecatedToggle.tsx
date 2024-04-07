import React, { SetStateAction, Dispatch } from "react";
import styles from "./index.module.scss";

interface Props {
    openDeprecatedFarm: boolean;
    setOpenDeprecatedFarm: Dispatch<SetStateAction<boolean>>;
}

export const DeprecatedToggle: React.FC<Props> = ({ openDeprecatedFarm, setOpenDeprecatedFarm }) => {
    return (
        <div className={styles.switchContainer}>
            Deprecated Vaults
            <label className={styles.switch}>
                <input
                    type="checkbox"
                    onClick={() => {
                        setOpenDeprecatedFarm((prev) => !prev);
                    }}
                    checked={openDeprecatedFarm}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
        </div>
    );
};
