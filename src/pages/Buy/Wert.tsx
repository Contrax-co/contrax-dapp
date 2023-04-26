import React from "react";
import WertWidget from "@wert-io/widget-initializer";
import { WertOptions } from "src/types";
import { WERT_PARTNER_ID } from "src/config/constants";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";

interface IProps {}

const WertWidgetId = "wert-widget";

const Wert: React.FC<IProps> = () => {
    const [wertWidget, setWertWidget] = React.useState<WertWidget | null>(null);
    const { currentWallet } = useWallet();
    const { lightMode } = useApp();

    const initWert = (options: WertOptions) => {
        const wertWidget = new WertWidget(options);
        wertWidget.mount();
        setWertWidget(wertWidget);
    };

    React.useEffect(() => {
        if (WERT_PARTNER_ID)
            initWert({
                partner_id: WERT_PARTNER_ID,
                container_id: WertWidgetId,
                width: 360,
                height: 580,
                commodities: "USDC:Polygon",
                lang: "en",
                address: currentWallet,
            });
    }, [currentWallet]);

    React.useEffect(() => {
        if (wertWidget) {
            wertWidget.setTheme({ theme: lightMode ? "light" : "dark" });
        }
    }, [lightMode, wertWidget]);

    return (
        <div>
            <div id={WertWidgetId}></div>
        </div>
    );
};

export default Wert;
