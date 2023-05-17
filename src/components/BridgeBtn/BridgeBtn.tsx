import React from "react";
import useWallet from "src/hooks/useWallet";
import useBridge from "src/hooks/useBridge";
import styles from "./BridgeBtn.module.scss";
import { CHAIN_ID } from "src/types/enums";
import { TiWarningOutline } from "react-icons/ti";

interface IProps {
    showDisclaimer?: boolean;
}

const BridgeBtn: React.FC<IProps> = ({ showDisclaimer }) => {
    const { switchNetworkAsync } = useWallet();
    const { polyUsdcToUsdc, isLoading, wrongNetwork, polygonUsdcBalance } = useBridge();

    return Number(polygonUsdcBalance) > 0.1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Polygon USDC: <b>{polygonUsdcBalance}</b>
                    </h3>
                </div>
            </div>
            <button
                className={`custom-button ${styles.bridgeButton}`}
                type="submit"
                disabled={isLoading}
                onClick={
                    wrongNetwork
                        ? () => {
                              switchNetworkAsync && switchNetworkAsync(CHAIN_ID.POLYGON);
                          }
                        : polyUsdcToUsdc
                }
            >
                {isLoading ? "Transferring..." : wrongNetwork ? "Transfer to Contrax" : "Transfer to Contrax"}
            </button>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                This will bridge (transfer) your entire Polygon USDC balance over to Arbitrum One network.
            </p>
        </div>
    ) : null;
};

export default BridgeBtn;
