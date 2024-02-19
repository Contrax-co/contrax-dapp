import React from "react";
import useWallet from "src/hooks/useWallet";
import useBridge from "src/hooks/bridge/useBridge";
import styles from "./BridgeEthBtn.module.scss";
import { CHAIN_ID } from "src/types/enums";
import { TiWarningOutline } from "react-icons/ti";
import { BridgeDirection } from "src/state/ramp/types";
import { customCommify } from "src/utils/common";
import { ReactComponent as EditSvg } from "src/assets/images/edit.svg";
import PolygonEthBridge from "../modals/PolygonEthBridge/PolygonEthBridge";

interface IProps {
    showDisclaimer?: boolean;
}

const BridgeEthBtn: React.FC<IProps> = ({ showDisclaimer }) => {
    const { switchNetworkAsync } = useWallet();
    const { startBridging, isLoading, wrongNetwork, usdAmount } = useBridge(
        BridgeDirection.ETH_POLYGON_TO_ARBITRUM_ETH
    );
    const [polygonModal, setPolygonModal] = React.useState(false);

    return usdAmount > 0.1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            {/* <div className={styles.editIconContainer}>
                <EditSvg className={styles.editIcon} onClick={() => setPolygonModal(true)} />
            </div> */}
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Polygon ETH: <b>${customCommify(usdAmount)}</b>
                    </h3>
                </div>
            </div>
            <div className={styles.btnContainer}>
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
                <button className={`custom-button ${styles.bridgeButton}`} onClick={() => setPolygonModal(true)}>
                    Custom Amount
                </button>
            </div>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                This will bridge (transfer) your entire Polygon ETH balance over to Arbitrum One network.
            </p>
            {polygonModal && (
                <PolygonEthBridge
                    handleClose={() => setPolygonModal(false)}
                    formattedBalance={usdAmount}
                    startBridging={startBridging}
                    wrongNetwork={wrongNetwork}
                />
            )}
        </div>
    ) : null;
};

export default BridgeEthBtn;
