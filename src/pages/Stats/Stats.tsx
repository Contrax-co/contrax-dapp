import styles from "./Stats.module.scss";
import PlatformTVL from "../Dashboard/PlatformTVL/PlatformTVL";
import { StatsTable } from "src/components/StatsTable/StatsTable";
import { useStats } from "src/hooks/useStats";
import { StatsCard } from "src/components/StatsCard/StatsCard";

function Stats() {
    const { meanTvl, medianTvl, modeTvl } = useStats();
    console.log(modeTvl);
    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <PlatformTVL />
                <StatsCard heading="Mean TVL" value={meanTvl} />
                <StatsCard heading="Median TVL" value={medianTvl} />
                <StatsCard heading="Mode TVL" value={modeTvl} />
            </div>
            <StatsTable />
        </div>
    );
}

export default Stats;
