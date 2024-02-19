import React from "react";
import useWallet from "src/hooks/useWallet";
import useBridge from "src/hooks/bridge/useBridge";
import styles from "./BridgeBtn.module.scss";
import { CHAIN_ID } from "src/types/enums";
import { TiWarningOutline } from "react-icons/ti";
import { BridgeDirection } from "src/state/ramp/types";
import PolygonUSDCBridge from "../modals/PolygonUSDCBridge/PolygonUSDCBridge";

interface IProps {
    showDisclaimer?: boolean;
}

const BridgeBtn: React.FC<IProps> = ({ showDisclaimer }) => {
    const { switchNetworkAsync } = useWallet();
    const { startBridging, isLoading, wrongNetwork, formattedBalance } = useBridge(
        BridgeDirection.USDC_POLYGON_TO_ARBITRUM_USDC
    );
    const [polygonUSDCModal, setPolygonUSDCModal] = React.useState(false);

    return Number(formattedBalance) > 0.1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Polygon USDC: <b>{formattedBalance}</b>
                    </h3>
                </div>
            </div>
            <div className={styles.USDCBtnContainer}>
                <button
                    className={`custom-button ${styles.bridgeButton}`}
                    type="submit"
                    disabled={isLoading}
                    onClick={
                        wrongNetwork
                            ? () => {
                                  switchNetworkAsync && switchNetworkAsync(CHAIN_ID.POLYGON);
                              }
                            : () => startBridging()
                    }
                >
                    {isLoading ? "Transferring..." : wrongNetwork ? "Transfer All" : "Transfer All"}
                </button>
                <button className={`custom-button ${styles.bridgeButton}`} onClick={() => setPolygonUSDCModal(true)}>
                    Custom Amount
                </button>
            </div>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                This will bridge (transfer) your entire Polygon USDC balance over to Arbitrum One network.
            </p>
            {polygonUSDCModal && (
                <PolygonUSDCBridge
                    handleClose={() => setPolygonUSDCModal(false)}
                    formattedBalance={Number(formattedBalance)}
                    startBridging={startBridging}
                    wrongNetwork={wrongNetwork}
                />
            )}
        </div>
    ) : null;
};

export default BridgeBtn;
