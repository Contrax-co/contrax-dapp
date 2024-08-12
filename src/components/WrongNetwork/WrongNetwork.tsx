import styles from "./WrongNetwork.module.scss";
import { FaNetworkWired } from "react-icons/fa";
import { CHAIN_ID } from "src/types/enums";
import useWallet from "src/hooks/useWallet";

export const WrongNetwork = () => {
    const { switchExternalChain } = useWallet();
    return (
        <div className={styles.sign_in_placeholder}>
            <FaNetworkWired className={styles.walletIcon} />
            <p className={styles.disclaimer}>Not on Arbitrum</p>
            <p className={styles.description}>Please Change Your network to Arbitrum to use Contrax.</p>
            <button className="custom-button" onClick={() => switchExternalChain(CHAIN_ID.ARBITRUM)}>
                Switch to Arbitrum
            </button>
        </div>
    );
};
