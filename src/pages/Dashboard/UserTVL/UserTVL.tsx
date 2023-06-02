import useTVL from "src/hooks/useUserTVL";
import { customCommify } from "src/utils/common";
import styles from "./UserTVL.module.scss";

interface Props {}

const UserTVL: React.FC<Props> = () => {
    const { userTVL } = useTVL();

    if (userTVL < 1 || Number.isNaN(Number(userTVL.toFixed(0)))) return null;

    return (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>My Total Value Staked</p>
            <p className={styles.value}>
                {customCommify(userTVL.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
            </p>
        </div>
    );
};

export default UserTVL;
