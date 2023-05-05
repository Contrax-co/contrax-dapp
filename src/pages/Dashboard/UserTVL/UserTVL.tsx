import useTVL from "src/hooks/useTVL";
import { commify } from "ethers/lib/utils.js";
import styles from "./UserTVL.module.scss";

interface Props {}

const VaultItem: React.FC<Props> = () => {
    const { userTVL } = useTVL();

    if (userTVL === 0) return <div></div>;

    return (
        <div className={styles.tvlContainer}>
            <p className={styles.tvlHeading}>My Total Value Locked</p>
            <p className={styles.tvlValue}>${commify(userTVL.toFixed(0))}</p>
        </div>
    );
};

export default VaultItem;
