import React from "react";
import WertWidget from "@wert-io/widget-initializer";
import { WertOptions } from "src/types";
import { WERT_PARTNER_ID } from "src/config/constants";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import useBridge from "src/hooks/useBridge";
import BridgeBtn from "src/components/BridgeBtn/BridgeBtn";
import styles from "./Buy.module.scss";
import { TiWarningOutline } from "react-icons/ti";

interface IProps {}

const WertWidgetId = "wert-widget";

const Wert: React.FC<IProps> = () => {
    const [wertWidget, setWertWidget] = React.useState<WertWidget | null>(null);
    const { currentWallet } = useWallet();
    const { lightMode } = useApp();
    const { polyUsdcToUsdc } = useBridge();

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
            <p className={styles.lightText} style={{ textAlign: "justify" }}>
                Bridging puts your tokens on the right network for Contrax. It occurs automatically for social wallets
                and can take up to 15 minutes, and may be slightly different than purchased amount. For Non social login
                wallets, please allow a few minutes for Polygon USDC to arrive, and then bridge it to Arbitrum in one
                click on the dashboard, and will need a few cents of MATIC on the Polygon network.
            </p>
        </div>
    );
};

export default Wert;
