import React from "react";
import styles from "./SortPopup.module.scss";
import { FarmSortOptions } from "src/types/enums";

interface Props {
    setSortSelected: React.Dispatch<React.SetStateAction<FarmSortOptions>>;
    sortSelected: FarmSortOptions;
}

const SortPopup: React.FC<Props> = ({ setSortSelected }) => {
    return (
        <div className={styles.container}>
            <p className={styles.row} onClick={() => setSortSelected(FarmSortOptions.Default)}>
                {FarmSortOptions.Default}
            </p>
            <p className={styles.row} onClick={() => setSortSelected(FarmSortOptions.APY_Low_to_High)}>
                {FarmSortOptions.APY_Low_to_High}
            </p>
            <p className={styles.row} onClick={() => setSortSelected(FarmSortOptions.APY_High_to_Low)}>
                {FarmSortOptions.APY_High_to_Low}
            </p>
            <p className={styles.row} onClick={() => setSortSelected(FarmSortOptions.Deposit_High_to_Low)}>
                {FarmSortOptions.Deposit_High_to_Low}
            </p>
            <p className={styles.row} onClick={() => setSortSelected(FarmSortOptions.Deposit_Low_to_High)}>
                {FarmSortOptions.Deposit_Low_to_High}
            </p>
            <p className={styles.row} onClick={() => setSortSelected(FarmSortOptions.Farms_Onchain)}>
                {FarmSortOptions.Farms_Onchain}
            </p>
            <p className={styles.row} onClick={() => setSortSelected(FarmSortOptions.Farms_Cross_Chain)}>
                {FarmSortOptions.Farms_Cross_Chain}
            </p>
        </div>
    );
};

export default SortPopup;
