import React, { useMemo } from "react";
import styles from "./BoostedApy.module.scss";

interface IProps {}

const BoostedApy: React.FC<IProps> = () => {
    const boostedApy = useMemo(() => {
        return 0;
    }, []);
    return Number(boostedApy) > 0 ? (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>Boosted APY</p>
            <p className={styles.value}>{boostedApy}</p>
        </div>
    ) : null;
};

export default BoostedApy;
