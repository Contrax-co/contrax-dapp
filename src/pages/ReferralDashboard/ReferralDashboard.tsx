import React from "react";
import styles from "./ReferralDashboard.module.scss";
import { ReferralCard } from "src/components/ReferralCard/ReferralCard";
import { ReferralDashboardTable } from "src/components/ReferralDashboardTable/ReferralDashboardTable";
// import { ReferralDashboardTable } from "src/components/ReferralDashboardTable/ReferralDashboardTable";

const ReferralDashboard: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <ReferralCard heading="1st Place ~ $300 USDC" address={"0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8"} />
                <ReferralCard heading="2nd Place ~ $300 USDC" address={"0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8"} />
                <ReferralCard heading="3rd Place ~ $300 USDC" address={"0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8"} />
            </div>
            <ReferralDashboardTable />
        </div>
    );
};

export default ReferralDashboard;
