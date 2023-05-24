import { useStats } from "src/hooks/useStats";
import PlatformTVL from "../Dashboard/PlatformTVL/PlatformTVL";
import styles from "./Stats.module.scss";
import { useState } from "react";

function Stats() {
    const [page, setPage] = useState(1);
    const { userTVLs } = useStats(page);
    return (
        <div className={styles.container}>
            <PlatformTVL />
            <table>
                <thead>
                    <td>address</td>
                    <td>value</td>
                </thead>
                <tbody>
                    {userTVLs?.map(({ id, tvl }) => (
                        <tr>
                            <td>{id}</td>
                            <td>{tvl}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Stats;
