import { ReactComponent as WalletSvg } from "src/assets/images/walletSvg.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./NotSignedIn.module.scss";
import { FC } from "react";

interface Props {
    heading?: string;
    description?: string;
    buttonText?: string;
    className?: CSSRule | string;
}

export const NotSignedIn: FC<Props> = ({
    heading = "Please Sign In",
    description = "Sign in or sign up to use this page",
    buttonText = "Sign In/Up",
    className,
}) => {
    return (
        <div className={styles.sign_in_placeholder + " " + className}>
            <WalletSvg className={styles.walletIcon} />
            <p className={styles.disclaimer}>{heading}</p>
            <p className={styles.description}>{description}</p>
            <ConnectButton label={buttonText} />
        </div>
    );
};
