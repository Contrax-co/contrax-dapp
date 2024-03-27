import styles from "./PlatformTVL.module.scss";
import { customCommify } from "src/utils/common";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";

interface Props {}

const PlatformTVL: React.FC<Props> = () => {
    const { platformTVL } = usePlatformTVL();

    if (!platformTVL) return <div></div>;

    return (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>Platform Total Value Staked</p>
            <p className={styles.value}>
                {customCommify(platformTVL.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    );
};

export default PlatformTVL;
