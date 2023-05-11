import React from "react";
import useWallet from "src/hooks/useWallet";
import useBridge from "src/hooks/useBridge";
import styles from "./BridgeBtn.module.scss";
import { useBalance } from "wagmi";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { TiWarningOutline } from "react-icons/ti";

interface IProps {
    showDisclaimer?: boolean;
}

const BridgeBtn: React.FC<IProps> = ({ showDisclaimer }) => {
    const { currentWallet, switchNetworkAsync } = useWallet();
    const { polyUsdcToUsdc, isLoading, wrongNetwork } = useBridge();
    const { data } = useBalance({
        address: currentWallet as `0x${string}`,
        chainId: CHAIN_ID.POLYGON,
        watch: true,
        token: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress as `0x${string}`,
    });

    return Number(data?.formatted) > 0.1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Polygon USDC: <b>{data?.formatted}</b>
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
                {isLoading ? "Transfering..." : wrongNetwork ? "Switch Network" : "Transfer to Contrax"}
            </button>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                This will Bridge (Transfer) all your USDC from the Polygon to Arbitrum Network
            </p>
        </div>
    ) : null;
};

export default BridgeBtn;
