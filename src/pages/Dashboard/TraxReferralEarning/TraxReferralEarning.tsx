import { customCommify } from "src/utils/common";
import styles from "./TraxReferralEarning.module.scss";
import { useAppSelector } from "src/state";
import { ReactComponent as RefEarnIcon } from "src/assets/images/refEarn.svg";

interface Props {}

export const TraxReferralEarning: React.FC<Props> = () => {
    const { earnedTraxByReferral } = useAppSelector((state) => state.account);

    if (!earnedTraxByReferral || earnedTraxByReferral < 0.001 || Number.isNaN(Number(earnedTraxByReferral.toFixed(0))))
        return null;

    return (
        <div className={`outlinedContainer ${styles.container}`}>
            <p className={styles.heading}>TRAX from Referrals</p>
            <p className={styles.value}>
                <RefEarnIcon />
                {customCommify(earnedTraxByReferral, { minimumFractionDigits: 3, showDollarSign: false })}
            </p>
        </div>
    );
};
