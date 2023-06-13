import React from "react";
import useWallet from "src/hooks/useWallet";
import useBridge from "src/hooks/bridge/useBridge";
import styles from "./BridgeEthBtn.module.scss";
import { CHAIN_ID } from "src/types/enums";
import { TiWarningOutline } from "react-icons/ti";
import { BridgeDirection } from "src/state/ramp/types";

interface IProps {
    showDisclaimer?: boolean;
}

const BridgeEthBtn: React.FC<IProps> = ({ showDisclaimer }) => {
    const { switchNetworkAsync } = useWallet();
    const { startBridging, isLoading, wrongNetwork, formattedBalance } = useBridge(
        BridgeDirection.ETH_POLYGON_TO_ARBITRUM_ETH
    );

    return Number(formattedBalance) > 0.1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Polygon ETH: <b>{formattedBalance}</b>
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
                        : startBridging
                }
            >
                {isLoading ? "Transferring..." : wrongNetwork ? "Transfer to Contrax" : "Transfer to Contrax"}
            </button>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                This will bridge (transfer) your entire Polygon ETH balance over to Arbitrum One network.
            </p>
        </div>
    ) : null;
};

export default BridgeEthBtn;
