import React, { useMemo } from "react";
import styles from "./ReferralDashboard.module.scss";
import { ReferralCard } from "src/components/ReferralCard/ReferralCard";
import { ReferralDashboardTable } from "src/components/ReferralDashboardTable/ReferralDashboardTable";
import { useReferralDashboard } from "src/hooks/useReferralDashboard";
import { getPositionSuffix } from "src/utils";
import useAccountData from "src/hooks/useAccountData";
import useWallet from "src/hooks/useWallet";

const ReferralDashboard: React.FC = () => {
    const { referralLink } = useAccountData();
    const { currentWallet } = useWallet();
    const { data } = useReferralDashboard();
    const topThreeReferrals = useMemo(() => {
        return data?.sort((a, b) => b.tvlFromReferrals - a.tvlFromReferrals).slice(0, 3) ?? [];
    }, [data]);
    return (
        <div className={styles.container}>
            <h1 className={styles.mainHeading}>Intract Referral Contest</h1>
            <p className={styles.para}>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum numquam optio magnam laborum,
                sapiente ipsum maiores, quo iusto atque fugiat, sunt quis quos velit perferendis ex sint itaque! Animi,
                excepturi?{" "}
            </p>
            <p className={styles.para}>
                <b>Join the race with your referral link:</b>{" "}
                {currentWallet && referralLink ? (
                    <span className={styles.text}>{referralLink}</span>
                ) : (
                    <span className={styles.text}>Please sign in to see it here</span>
                )}
            </p>
            <div className={styles.topRow}>
                {topThreeReferrals.length > 0 &&
                    topThreeReferrals.map((referral, i) => (
                        <ReferralCard
                            key={referral.address}
                            heading={`${getPositionSuffix(i + 1)} Place ~ 300 USD`}
                            address={referral.address}
                        />
                    ))}
            </div>
            <ReferralDashboardTable referrals={data} />
        </div>
    );
};

export default ReferralDashboard;
