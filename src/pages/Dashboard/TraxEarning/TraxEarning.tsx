import { customCommify } from "src/utils/common";
import styles from "./TraxEarning.module.scss";
import { useAppSelector } from "src/state";

interface Props {}

export const TraxEarning: React.FC<Props> = () => {
    const { earnedTrax } = useAppSelector((state) => state.account);

    if (!earnedTrax || earnedTrax < 1 || Number.isNaN(Number(earnedTrax.toFixed(0)))) return null;

    return (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>Trax Earning</p>
            <p className={styles.value}>
                {customCommify(earnedTrax.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    );
};
