import React from "react";
import styles from "./BoostedApy.module.scss";
import { useStats } from "src/hooks/useStats";

interface IProps {}

const BoostedApy: React.FC<IProps> = () => {
    const { apyBoost } = useStats();

    return apyBoost && apyBoost > 0 ? (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>Boosted APY</p>
            <p className={styles.value}>{apyBoost}</p>
        </div>
    ) : null;
};

export default BoostedApy;
