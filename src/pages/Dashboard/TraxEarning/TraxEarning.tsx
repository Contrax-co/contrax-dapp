import { customCommify } from "src/utils/common";
import styles from "./TraxEarning.module.scss";
import { useAppSelector } from "src/state";
import { ReactComponent as EarnIcon } from "src/assets/images/earn.svg";
import { FaUserFriends } from "react-icons/fa";
import { MdAdd } from "react-icons/md";

interface Props {}

export const TraxEarning: React.FC<Props> = () => {
    const { earnedTrax } = useAppSelector((state) => state.account);

    if (!earnedTrax || earnedTrax < 0.001 || Number.isNaN(Number(earnedTrax.toFixed(0)))) return null;

    return (
        <div className={`outlinedContainer ${styles.container}`}>
            <p className={styles.heading}>TRAX from Staking</p>
            <p className={styles.value}>
                {/* <FaUserFriends size={120} /> */}
                <EarnIcon />
                {/* <MdAdd /> */}
                {customCommify(earnedTrax, { minimumFractionDigits: 3, showDollarSign: false })}
            </p>
        </div>
    );
};
