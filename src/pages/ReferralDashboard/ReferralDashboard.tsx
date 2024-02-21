import React, { useMemo } from "react";
import styles from "./ReferralDashboard.module.scss";
import { ReferralCard } from "src/components/ReferralCard/ReferralCard";
import { ReferralDashboardTable } from "src/components/ReferralDashboardTable/ReferralDashboardTable";
import { useReferralDashboard } from "src/hooks/useReferralDashboard";
import { getPositionSuffix } from "src/utils";

const ReferralDashboard: React.FC = () => {
    const { data } = useReferralDashboard();
    const topThreeReferrals = useMemo(() => {
        return data?.sort((a, b) => b.tvlFromReferrals - a.tvlFromReferrals).slice(0, 3) ?? [];
    }, [data]);
    return (
        <div className={styles.container}>
            <p className={styles.para}>Lorem ipsum dolor sit amet consectetur </p>
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
