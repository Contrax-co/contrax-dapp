import styles from "./Stats.module.scss";
import PlatformTVL from "../Dashboard/PlatformTVL/PlatformTVL";
import { StatsTable } from "src/components/StatsTable/StatsTable";

function Stats() {
    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <PlatformTVL />
            </div>
            <StatsTable />
        </div>
    );
}

export default Stats;
