import { customCommify } from "src/utils/common";
import styles from "./TraxEarning.module.scss";
import { useAppSelector } from "src/state";

interface Props {}

export const TraxEarning: React.FC<Props> = () => {
    const { earnedTrax } = useAppSelector((state) => state.account);

    if (!earnedTrax || earnedTrax < 0.001 || Number.isNaN(Number(earnedTrax.toFixed(0)))) return null;

    return (
        <div className={`outlinedContainer ${styles.container}`}>
            <p className={styles.heading}>TRAX Earning</p>
            <p className={styles.value}>
                {customCommify(earnedTrax, { minimumFractionDigits: 3, showDollarSign: false })}
            </p>
        </div>
    );
};
