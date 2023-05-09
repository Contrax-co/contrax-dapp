import { ReactComponent as WalletSvg } from "src/assets/images/walletSvg.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./NotSignedIn.module.scss";

export const NotSignedIn = () => {
    return (
        <div className={styles.sign_in_placeholder}>
            <WalletSvg className={styles.walletIcon} />
            <p className={styles.disclaimer}>Not Signed In</p>
            <p className={styles.description}>Sign In to get the the full experience of Contrax</p>
            <ConnectButton label="Sign In/Up" />
        </div>
    );
};
