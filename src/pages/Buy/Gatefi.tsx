import React, { useState } from "react";
import styles from "./Buy.module.scss";
import useWallet from "src/hooks/useWallet";
import { GateFiDisplayModeEnum, GateFiSDK } from "@gatefi/js-sdk";
import BridgeBtn from "src/components/BridgeBtn/BridgeBtn";
import useBridge from "src/hooks/bridge/useBridge";
import { GATEFI_MERCHANT_ID } from "src/config/constants";
import useApp from "src/hooks/useApp";
import { BridgeDirection } from "src/state/ramp/types";
import { TiWarningOutline } from "react-icons/ti";

interface IProps {}

const Gatefi: React.FC<IProps> = () => {
    const { currentWallet } = useWallet();
    const { lightMode } = useApp();
    // const { startBridging, isLoading, usdAmount } = useBridge(BridgeDirection.USDC_POLYGON_TO_ARBITRUM_USDC);
    const [gateFiInstance, setGateFiInstance] = useState<GateFiSDK>();
    // const [initialUsdAmount, setInitialUsdAmount] = useState(usdAmount);

    // React.useEffect(() => {
    //     if (usdAmount !== initialUsdAmount && !isLoading && usdAmount > 1) {
    //         startBridging();
    //         setInitialUsdAmount(usdAmount);
    //     }
    // }, [initialUsdAmount, startBridging, isLoading, usdAmount]);

    React.useEffect(() => {
        let instance = new GateFiSDK({
            merchantId: GATEFI_MERCHANT_ID,
            displayMode: GateFiDisplayModeEnum.Embedded,

            nodeSelector: "#overlay-button",
            walletAddress: currentWallet,
            defaultFiat: {
                currency: "USD",
                amount: "500",
            },
            defaultCrypto: {
                currency: "USDC-ARBITRUM",
            },
            availableCrypto: ["USDC-ARBITRUM"],
            styles: {
                type: lightMode ? "light" : "dark",
            },
        });
        setGateFiInstance(instance);
        return () => {
            instance.destroy();
        };
    }, [currentWallet]);

    React.useEffect(() => {
        if (gateFiInstance) {
            gateFiInstance.setThemeType(lightMode ? "light" : "dark");
        }
    }, [lightMode]);

    return (
        <div style={{ width: 360 }}>
            {/* <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                USDC is auto-bridged to arbitrum on purchase*
            </p> */}
            <div id="overlay-button" className={styles.gatefiWrapper}></div>
            {/* <BridgeBtn /> */}
            {/* <p className={styles.lightText} style={{ textAlign: "justify", paddingBottom: 50 }}>
                Bridging puts your tokens on the right network for Contrax. If you logged in using a social account, you
                just have to wait 5 to 15 minutes after Wert sends your USDC. For Web3 wallets like MetaMask, you then
                also have to go to the dashboard and bridge it in one click with a few cents of MATIC on the Polygon
                network. See full details on buying in the{" "}
                <a href="https://docs.contrax.finance/contrax-dapp/buy">user guide</a>.
            </p> */}
        </div>
    );
};

export default Gatefi;
