import { customCommify } from "src/utils/common";
import styles from "./TraxReferralEarning.module.scss";
import { useAppSelector } from "src/state";

interface Props {}

export const TraxReferralEarning: React.FC<Props> = () => {
    const { earnedTraxByReferral } = useAppSelector((state) => state.account);

    if (!earnedTraxByReferral || earnedTraxByReferral < 1 || Number.isNaN(Number(earnedTraxByReferral.toFixed(0))))
        return null;

    return (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>Trax Earning</p>
            <p className={styles.value}>
                {customCommify(earnedTraxByReferral.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    );
};
