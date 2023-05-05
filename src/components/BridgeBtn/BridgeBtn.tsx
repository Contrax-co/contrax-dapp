import React from "react";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import useBridge from "src/hooks/useBridge";
import styles from "./BridgeBtn.module.scss";
import { useBalance } from "wagmi";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { TiWarningOutline } from "react-icons/ti";

interface IProps {}

const BridgeBtn: React.FC<IProps> = () => {
    const { currentWallet } = useWallet();
    const { lightMode } = useApp();
    const { polyUsdcToUsdc, isLoading } = useBridge();
    const { data } = useBalance({
        address: currentWallet as `0x${string}`,
        chainId: CHAIN_ID.POLYGON,
        watch: true,
        token: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress as `0x${string}`,
    });
    console.log(data);

    return Number(data?.formatted) > 0.1 ? (
        <div className={styles.container}>
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Polygon USDC:
                        <br />
                        <b>{data?.formatted}</b>
                    </h3>
                </div>
                <button
                    className={`custom-button ${lightMode && "custom-button-light"}`}
                    type="submit"
                    disabled={false}
                    onClick={polyUsdcToUsdc}
                >
                    Bridge to Arbitrum
                </button>
            </div>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                This action will Bridge (Transfer) all your funds from polygon to Arbitrum Network
            </p>
        </div>
    ) : null;
};

export default BridgeBtn;
