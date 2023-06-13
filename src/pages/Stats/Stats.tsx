import styles from "./Stats.module.scss";
import PlatformTVL from "../Dashboard/PlatformTVL/PlatformTVL";
import { StatsTable } from "src/components/StatsTable/StatsTable";
import { useStats } from "src/hooks/useStats";
import { StatsCard } from "src/components/StatsCard/StatsCard";
import { MyReferrals } from "src/components/MyReferrals/MyReferrals";

function Stats() {
    const { meanTvl, medianTvl, activeUsers } = useStats();
    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <PlatformTVL />
                <StatsCard heading="Mean TVL" value={meanTvl} />
                <StatsCard heading="Active Users" value={activeUsers} />
            </div>
            <StatsTable />
            <MyReferrals />
        </div>
    );
}

export default Stats;
