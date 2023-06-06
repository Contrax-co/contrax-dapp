import styles from "./Stats.module.scss";
import PlatformTVL from "../Dashboard/PlatformTVL/PlatformTVL";
import { StatsTable } from "src/components/StatsTable/StatsTable";
import { useStats } from "src/hooks/useStats";
import { StatsCard } from "src/components/StatsCard/StatsCard";
import { useEffect, useState } from "react";
import useWallet from "src/hooks/useWallet";
import axios from "axios";

function Stats() {
    const { meanTvl, medianTvl, modeTvl } = useStats();
    const { currentWallet } = useWallet();
    const [referrals, setReferrals] = useState<string[]>();
    useEffect(() => {
        (async () => {
            const res = await axios.get<{ data: { accounts: string[] } }>(
                `https://contrax-backend.herokuapp.com/api/v1/account/reffered-accounts/${currentWallet}`
            );
            setReferrals(res.data.data.accounts);
        })();
    }, [currentWallet]);
    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <PlatformTVL />
                <StatsCard heading="Mean TVL" value={meanTvl} />
                <StatsCard heading="Median TVL" value={medianTvl} />
                <StatsCard heading="Mode TVL" value={modeTvl} />
            </div>
            <StatsTable />
            {currentWallet && referrals && (
                <>
                    <h2 style={{ margin: 0 }}>My referrals:</h2>
                    {referrals.length > 0 ? (
                        referrals?.map((add) => <div key={add}>{add}</div>)
                    ) : (
                        <p>no referrals yet</p>
                    )}
                </>
            )}
        </div>
    );
}

export default Stats;
