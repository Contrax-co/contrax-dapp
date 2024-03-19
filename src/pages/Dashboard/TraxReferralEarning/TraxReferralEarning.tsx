import { customCommify } from "src/utils/common";
import styles from "./TraxReferralEarning.module.scss";
import { useAppSelector } from "src/state";
import { ReactComponent as RefEarnIcon } from "src/assets/images/refEarn.svg";

interface Props {}

export const TraxReferralEarning: React.FC<Props> = () => {
    const { earnedTraxByReferral, totalEarnedTraxByReferral } = useAppSelector((state) => state.account);
    const trax =
        (totalEarnedTraxByReferral || 0) > (earnedTraxByReferral || 0)
            ? totalEarnedTraxByReferral
            : earnedTraxByReferral;

    if (!trax || trax < 0.001 || Number.isNaN(Number(trax.toFixed(0)))) return null;

    return (
        <div className={`outlinedContainer ${styles.container}`}>
            <p className={styles.heading}>TRAX from Referrals</p>
            <p className={styles.value}>
                <RefEarnIcon />
                {customCommify(trax, { minimumFractionDigits: 3, showDollarSign: false })}
            </p>
        </div>
    );
};
