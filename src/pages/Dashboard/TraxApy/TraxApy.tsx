import { customCommify } from "src/utils/common";
import styles from "./TraxApy.module.scss";
import { ReactComponent as WalletIcon } from "src/assets/images/walletSvg.svg";
import useTrax from "src/hooks/useTrax";

interface Props {}

export const TraxApy: React.FC<Props> = () => {
    const { totalTraxApy } = useTrax();

    if (!(totalTraxApy > 0)) return null;

    return (
        <div className={`outlinedContainer ${styles.container}`}>
            <p className={styles.heading}>xTRAX Yearly Rate </p>
            <p className={styles.value}>
                {/* <FaUserFriends size={120} /> */}
                <WalletIcon />
                {/* <MdAdd /> */}
                {customCommify(totalTraxApy, { minimumFractionDigits: 0, showDollarSign: false })}
            </p>
        </div>
    );
};
