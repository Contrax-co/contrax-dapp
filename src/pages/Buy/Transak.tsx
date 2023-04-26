import React from "react";
import styles from "./Buy.module.scss";
import { RAMP_TRANSAK_API_KEY } from "src/config/constants";
import useWallet from "src/hooks/useWallet";

interface IProps {}

const Transak: React.FC<IProps> = () => {
    const { currentWallet } = useWallet();

    return (
        <div className={styles.darkBuy}>
            <iframe
                height="625"
                title="Transak On/Off Ramp Widget"
                src={`https://global.transak.com/?apiKey=${RAMP_TRANSAK_API_KEY}&defaultCryptoCurrency=USDC&defaultFiatAmount=500&disableWalletAddressForm=true&network=arbitrum&walletAddress=${currentWallet}`}
                frameBorder={"no"}
                allowTransparency={true}
                allowFullScreen={true}
                style={{ display: "block", width: "100%", maxHeight: "625px", maxWidth: "500px" }}
            ></iframe>
        </div>
    );
};

export default Transak;
