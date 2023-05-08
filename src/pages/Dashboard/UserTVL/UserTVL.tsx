import useTVL from "src/hooks/useTVL";
import { commify } from "ethers/lib/utils.js";
import { customCommify } from "src/utils/common";
import styles from "./UserTVL.module.scss";

interface Props {}

const VaultItem: React.FC<Props> = () => {
    const { userTVL } = useTVL();

    if (userTVL === 0) return <div></div>;

    return (
        <div className={`colorContainer ${styles.tvlContainer}`}>
            <p className={styles.tvlHeading}>My Total Value Staked</p>
            <p className={styles.tvlValue}>
                {customCommify(userTVL.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    );
};

export default VaultItem;
