import useTVL from "src/hooks/useTVL";
import { customCommify } from "src/utils/common";
import styles from "./UserTVL.module.scss";
import useWallet from "src/hooks/useWallet";
import { CHAIN_ID } from "src/types/enums";

interface Props {}

const VaultItem: React.FC<Props> = () => {
    const { userTVL } = useTVL();
    const { networkId } = useWallet();

    if (userTVL === 0) return null;

    return (
        <div className={`colorContainer ${styles.tvlContainer}`}>
            <p className={styles.tvlHeading}>My Total Value Staked</p>
            {networkId === CHAIN_ID.ARBITRUM ? (
                <p className={styles.tvlValue}>
                    {customCommify(userTVL.toFixed(0), { minimumFractionDigits: 0, showDollarSign: true })}
                </p>
            ) : (
                <p className={styles.networkDisclaimer}>Change network to arbitrum to use Dashboard</p>
            )}
        </div>
    );
};

export default VaultItem;
