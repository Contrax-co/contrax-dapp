import React from "react";
import WertWidget from "@wert-io/widget-initializer";
import { WertOptions } from "src/types";
import { WERT_PARTNER_ID } from "src/config/constants";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import useBridge from "src/hooks/useBridge";
import BridgeBtn from "src/components/BridgeBtn/BridgeBtn";

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
        <div>
            <div id={WertWidgetId}></div>
            <BridgeBtn />
        </div>
    );
};

export default Wert;
