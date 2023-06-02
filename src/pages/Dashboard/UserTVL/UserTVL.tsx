import useUserTVL from "src/hooks/useUserTVL";
import { customCommify } from "src/utils/common";
import styles from "./UserTVL.module.scss";

interface Props {}

const UserTVL: React.FC<Props> = () => {
    const { tvl } = useUserTVL();

    if (tvl === 0 || Number.isNaN(Number(tvl?.toFixed(0)))) return null;

    return (
        <div className={`colorContainer ${styles.tvlContainer}`}>
            <p className={styles.tvlHeading}>My Total Value Staked</p>
            <p className={styles.tvlValue}>
                {customCommify(tvl?.toFixed(0) || 0, { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    );
};

export default UserTVL;
