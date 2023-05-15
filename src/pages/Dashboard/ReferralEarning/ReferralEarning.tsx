import { useEffect } from "react";
import styles from "./ReferralEarning.module.scss";
import { getReferralEarning } from "src/state/account/accountReducer";
import useWallet from "src/hooks/useWallet";
import { useAppDispatch, useAppSelector } from "src/state";
import { customCommify } from "src/utils/common";

const ReferralEarning = () => {
    const { currentWallet } = useWallet();
    const dispatch = useAppDispatch();
    const referralEarning = useAppSelector((state) => state.account.referralEarning);

    useEffect(() => {
        dispatch(getReferralEarning(currentWallet));
        const int = setInterval(async () => {
            dispatch(getReferralEarning(currentWallet));
        }, 10000);

        return () => {
            clearInterval(int);
        };
    }, [currentWallet]);

    return referralEarning && referralEarning >= 1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            <p className={styles.heading}>Referral Earnings</p>
            <p className={styles.value}>
                {customCommify(referralEarning.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    ) : null;
};

export default ReferralEarning;
