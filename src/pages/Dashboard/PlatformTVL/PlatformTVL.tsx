import useTVL from "src/hooks/useTVL";
import styles from "./PlatformTVL.module.scss";
import { customCommify } from "src/utils/common";

interface Props {}

const PlatformTVL: React.FC<Props> = () => {
    const { platformTVL } = useTVL();

    if (platformTVL === 0) return <div></div>;

    return (
        <div className={`colorContainer ${styles.tvlContainer}`}>
            <p className={styles.tvlHeading}>Platform Total Value Staked</p>
            <p className={styles.tvlValue}>
                {customCommify(platformTVL.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    );
};

export default PlatformTVL;
