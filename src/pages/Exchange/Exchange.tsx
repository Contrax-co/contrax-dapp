import React, { useRef } from "react";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { Bridge } from "@socket.tech/plugin";
import { defaultChainId, SOCKET_API_KEY } from "src/config/constants";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import Logo from "src/assets/images/logo.png";
import PoolButton from "src/components/PoolButton/PoolButton";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import styles from "./Exchange.module.scss";

interface IProps {}

const darkSocketTheme = {
    width: 360,
    responsiveWidth: false,
    borderRadius: 1,
    secondary: "rgb(68,69,79)",
    primary: "rgb(31,34,44)",
    accent: "rgb(131,249,151)",
    onAccent: "rgb(0,0,0)",
    interactive: "rgb(0,0,0)",
    onInteractive: "rgb(240,240,240)",
    text: "rgb(255,255,255)",
    secondaryText: "rgb(200,200,200)",
};
const lightSocketTheme = {
    width: 360,
    responsiveWidth: false,
    borderRadius: 1,
    secondary: "rgb(241,245,249)",
    primary: "rgb(255,255,255)",
    accent: "rgb(239,51,116)",
    onAccent: "rgb(255,255,255)",
    interactive: "rgb(241,245,249)",
    onInteractive: "rgb(10,10,10)",
    text: "rgb(0,0,0)",
    secondaryText: "rgb(68,68,68)",
};
enum Tab {
    Swap,
    Bridge,
    Onramp,
}
const Exchange: React.FC<IProps> = () => {
    const { signer, connectWallet } = useWallet();
    const { lightMode } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const [tab, setTab] = React.useState<Tab>(Tab.Bridge);

    React.useEffect(() => {
        if (tab === Tab.Onramp) {
            const ramp = new RampInstantSDK({
                hostAppName: "Contrax",
                hostLogoUrl: `https://${window.location.host}/logo.svg`,
                hostApiKey: "brs8apap5mdgrb5mfdk8pgmhnqxjugpr4nfpzg7f",
                variant: "embedded-mobile",
                containerNode: containerRef.current || undefined,
            }).show();
            return () => {
                ramp.close();
            };
        }
    }, [containerRef, tab]);

    return (
        <div
            style={{
                paddingTop: 20,
                overflow: "auto",
                gridTemplateRows: "553px",
                // display: "grid",
                // justifyContent: "center",
                // alignItems: "center",
                paddingBottom: 20,
            }}
        >
            <div className="drop_buttons">
                <PoolButton variant={2} onClick={() => setTab(Tab.Swap)} description="Swap" active={tab === Tab.Swap} />
                <PoolButton
                    variant={2}
                    onClick={() => setTab(Tab.Bridge)}
                    description="Bridge"
                    active={tab === Tab.Bridge}
                />
                <PoolButton
                    variant={2}
                    onClick={() => setTab(Tab.Onramp)}
                    description="Onramp"
                    active={tab === Tab.Onramp}
                />
            </div>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
                {tab === Tab.Swap && SOCKET_API_KEY && (
                    <SwapWidget
                        theme={lightMode ? lightTheme : darkTheme}
                        // @ts-ignore
                        provider={signer?.provider}
                        onConnectWalletClick={connectWallet}
                    />
                )}
                {tab === Tab.Bridge && SOCKET_API_KEY && (
                    <Bridge
                        provider={signer?.provider}
                        API_KEY={SOCKET_API_KEY}
                        // enableSameChainSwaps
                        singleTxOnly
                        enableRefuel
                        includeBridges={[
                            "polygon-bridge",
                            "hop",
                            "anyswap-router-v4",
                            "hyphen",
                            "arbitrum-bridge",
                            "connext",
                            "celer",
                            // "across",
                            "optimism-bridge",
                            "refuel-bridge",
                        ]}
                        defaultSourceNetwork={1}
                        defaultDestNetwork={defaultChainId}
                        customize={lightMode ? lightSocketTheme : darkSocketTheme}
                    />
                )}
                {tab === Tab.Onramp && (
                    <div className={styles.darkOnramp}>
                        <div style={{ width: 375, height: 667 }} ref={containerRef}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Exchange;
