import styles from "./Stats.module.scss";
import PlatformTVL from "../Dashboard/PlatformTVL/PlatformTVL";
import { UserStatsTable } from "src/components/UserStatsTable/UserStatsTable";
import { useStats } from "src/hooks/useStats";
import { StatsCard } from "src/components/StatsCard/StatsCard";
import { MyReferrals } from "src/components/MyReferrals/MyReferrals";
import { VaultStatsTable } from "src/components/VaultStatsTable/VaultStatsTable";

function Stats() {
    const { meanTvl, medianTvl, activeUsers } = useStats();
    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <PlatformTVL />
                <StatsCard heading="Mean TVL" value={meanTvl} />
                <StatsCard heading="Active Users" value={activeUsers} />
            </div>
            <UserStatsTable />
            <VaultStatsTable />
            <MyReferrals />
        </div>
    );
}

export default Stats;
