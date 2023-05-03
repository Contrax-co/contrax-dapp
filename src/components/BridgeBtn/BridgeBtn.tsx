import React from "react";
import WertWidget from "@wert-io/widget-initializer";
import { WertOptions } from "src/types";
import { WERT_PARTNER_ID } from "src/config/constants";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import useBridge from "src/hooks/useBridge";
import styles from "./BridgeBtn.module.scss";
import { useBalance } from "wagmi";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";

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
        <div style={{ gap: 20, marginTop: 10, paddingBottom: 50 }} className="center">
            <div>
                <h3 className={`${styles.usdcAmount} ${lightMode && styles.light}`}>
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
    ) : null;
};

export default BridgeBtn;
