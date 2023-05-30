import React, { useState } from "react";
import styles from "./Buy.module.scss";
import useWallet from "src/hooks/useWallet";
import { GateFiDisplayModeEnum, GateFiEventTypes, GateFiSDK, TGateFiStylesScheme } from "@gatefi/js-sdk";
import BridgeBtn from "src/components/BridgeBtn/BridgeBtn";
import { useSearchParams } from "react-router-dom";
import useBridge from "src/hooks/useBridge";
import { GATEFI_MERCHANT_ID } from "src/config/constants";
import useApp from "src/hooks/useApp";

interface IProps {}

const Gatefi: React.FC<IProps> = () => {
    const { currentWallet } = useWallet();
    const { lightMode } = useApp();
    const [params] = useSearchParams();
    const { polyUsdcToUsdc, isLoading } = useBridge();
    const [gateFiInstance, setGateFiInstance] = useState<GateFiSDK>();

    React.useEffect(() => {
        let success = params.get("success");
        if (Boolean(success) && !isLoading) {
            polyUsdcToUsdc();
        }
    }, [params, polyUsdcToUsdc, isLoading]);

    React.useEffect(() => {
        let intance = new GateFiSDK({
            merchantId: GATEFI_MERCHANT_ID,
            displayMode: GateFiDisplayModeEnum.Embedded,
            nodeSelector: "#overlay-button",
            walletAddress: currentWallet,
            successUrl: `${window.location.href}&success=true`,
            defaultFiat: {
                currency: "USD",
                amount: "500",
            },
            defaultCrypto: {
                currency: "USDC-MATIC",
            },
            availableCrypto: ["USDC-MATIC"],
            styles: {
                type: lightMode ? "light" : "dark",
            },
        });
        setGateFiInstance(intance);
        return () => {
            intance.destroy();
        };
    }, [currentWallet]);

    React.useEffect(() => {
        if (gateFiInstance) {
            gateFiInstance.setThemeType(lightMode ? "light" : "dark");
        }
    }, [lightMode]);

    return (
        <div style={{ width: 420 }}>
            <div id="overlay-button" style={{ width: 420, height: 680, paddingBottom: 16 }}></div>
            <BridgeBtn />
            <p className={styles.lightText} style={{ textAlign: "justify", paddingBottom: 50 }}>
                Bridging puts your tokens on the right network for Contrax. If you logged in using a social account, you
                just have to wait 5 to 15 minutes after Wert sends your USDC. For Web3 wallets like MetaMask, you then
                also have to go to the dashboard and bridge it in one click with a few cents of MATIC on the Polygon
                network. See full details on buying in the{" "}
                <a href="https://docs.contrax.finance/contrax-dapp/buy">user guide</a>.
            </p>
        </div>
    );
};

export default Gatefi;
