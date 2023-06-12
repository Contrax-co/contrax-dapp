import React from "react";
import WertWidget from "@wert-io/widget-initializer";
import { WertOptions } from "src/types";
import { WERT_PARTNER_ID } from "src/config/constants";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import useBridge from "src/hooks/bridge/useBridge";
import BridgeBtn from "src/components/BridgeBtn/BridgeBtn";
import styles from "./Buy.module.scss";
import { TiWarningOutline } from "react-icons/ti";
import { BridgeDirection } from "src/state/ramp/types";

interface IProps {}

const WertWidgetId = "wert-widget";

const Wert: React.FC<IProps> = () => {
    const [wertWidget, setWertWidget] = React.useState<WertWidget | null>(null);
    const { currentWallet } = useWallet();
    const { lightMode } = useApp();
    const { polyUsdcToUsdc } = useBridge(BridgeDirection.USDC_POLYGON_TO_ARBITRUM_USDC);

    const initWert = (options: WertOptions) => {
        const wertWidget = new WertWidget(options);
        wertWidget.mount();
        setWertWidget(wertWidget);
    };

    React.useEffect(() => {
        if (WERT_PARTNER_ID)
            initWert({
                partner_id: WERT_PARTNER_ID,
                // partner_id: "01GX31S022ST3GB9WY9X4TNYNW",
                // origin: "https://sandbox.wert.io",
                container_id: WertWidgetId,
                width: 360,
                height: 580,
                commodities: "USDC:Polygon",
                lang: "en",
                address: currentWallet,
                listeners: {
                    "payment-status": async (data: any) => {
                        console.log("wert payment status", data);
                        if (data.status === "success") {
                            await polyUsdcToUsdc();
                        }
                    },
                },
            });
    }, [currentWallet]);

    React.useEffect(() => {
        if (wertWidget)
            wertWidget.listeners = {
                "payment-status": async (data: any) => {
                    console.log("wert payment status", data);
                    if (data.status === "success") {
                        await polyUsdcToUsdc();
                    }
                },
            };
    }, [wertWidget, polyUsdcToUsdc]);

    React.useEffect(() => {
        if (wertWidget) {
            wertWidget.setTheme({ theme: lightMode ? "light" : "dark" });
        }
    }, [lightMode, wertWidget]);

    return (
        <div style={{ width: 360 }}>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                USDC is auto-bridged to arbitrum on purchase*
            </p>
            <div id={WertWidgetId}></div>
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

export default Wert;
