import React, { SetStateAction, Dispatch } from "react";
import styles from "./index.module.scss";

import { useAppDispatch, useAppSelector } from "src/state";
import { toggleShowVaultsWithFunds } from "src/state/settings/settingsReducer";

export const VaultsWithFundsToggle: React.FC = () => {
    const showVaultsWithFunds = useAppSelector((state) => state.settings.showVaultsWithFunds);
    const dispatch = useAppDispatch();

    return (
        <div className={styles.switchContainer}>
            Only Show Vaults With Funds
            <label className={styles.switch}>
                <input
                    type="checkbox"
                    onClick={() => {
                        dispatch(toggleShowVaultsWithFunds());
                    }}
                    checked={showVaultsWithFunds}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
        </div>
    );
};
