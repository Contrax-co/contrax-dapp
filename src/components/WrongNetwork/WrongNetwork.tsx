import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./WrongNetwork.module.scss";
import { FaNetworkWired } from "react-icons/fa";
import { useSwitchNetwork } from "wagmi";
import { CHAIN_ID } from "src/types/enums";

export const WrongNetwork = () => {
    const { isLoading, switchNetwork } = useSwitchNetwork();
    return (
        <div className={styles.sign_in_placeholder}>
            <FaNetworkWired className={styles.walletIcon} />
            <p className={styles.disclaimer}>Not on Arbitrum</p>
            <p className={styles.description}>Please Change Your network to Arbitrum to use Contrax.</p>
            <button className="custom-button" disabled={isLoading} onClick={() => switchNetwork?.(CHAIN_ID.ARBITRUM)}>
                {isLoading ? "Switching..." : "Switch to Arbitrum"}
            </button>
        </div>
    );
};
