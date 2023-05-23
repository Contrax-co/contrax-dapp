import React from "react";
import styles from "./Buy.module.scss";
import useWallet from "src/hooks/useWallet";
import { GateFiDisplayModeEnum, GateFiEventTypes, GateFiSDK } from "@gatefi/js-sdk";
import BridgeBtn from "src/components/BridgeBtn/BridgeBtn";
import { useSearchParams } from "react-router-dom";
import useBridge from "src/hooks/useBridge";

interface IProps {}

const Gatefi: React.FC<IProps> = () => {
    const { currentWallet } = useWallet();
    const [params] = useSearchParams();
    const { polyUsdcToUsdc } = useBridge();

    React.useEffect(() => {
        let success = params.get("success");
        if (Boolean(success)) {
            polyUsdcToUsdc();
        }
    }, [params, polyUsdcToUsdc]);

    React.useEffect(() => {
        var instance = new GateFiSDK({
            merchantId: "36382c3a-cffb-4dd5-a5e5-7367c18c35ef",
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
        });
        instance.show();
        instance.subscribe(GateFiEventTypes.onClose, (type, payload) => {
            console.log(type, payload);
        });
        instance.subscribe(GateFiEventTypes.onLoad, (type, payload) => {
            console.log("load", type, payload);
        });
        return () => {
            instance.destroy();
        };
    }, [currentWallet]);
    return (
        <div style={{ width: 420 }}>
            <div id="overlay-button" style={{ width: 420, height: 680 }}></div>
            <BridgeBtn />
            <p className={styles.lightText} style={{ textAlign: "justify" }}>
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
