import React, { useRef } from "react";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { Bridge } from "@socket.tech/plugin";
import {
    defaultChainId,
    RAMP_TRANSAK_API_KEY,
    SOCKET_API_KEY,
    ZERODEV_PROJECT_ID,
    ZERODEV_PROJECT_ID_MAINNET,
} from "src/config/constants";

import PoolButton from "src/components/PoolButton/PoolButton";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import styles from "./Exchange.module.scss";
import "./Exchange.css";
import { useConnect, useDisconnect, useSigner, useSwitchNetwork, useWebSocketProvider } from "wagmi";
import { useSearchParams } from "react-router-dom";
import useBalances from "src/hooks/useBalances";
import { Tabs } from "src/components/Tabs/Tabs";
import uniswapTokens from "./uniswapTokens.json";
import {
    googleWallet,
    facebookWallet,
    githubWallet,
    discordWallet,
    twitchWallet,
    twitterWallet,
} from "@zerodevapp/wagmi/rainbowkit";
import { useAppSelector } from "src/state";

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
    Swap = "Swap",
    Bridge = "Bridge",
    Buy = "Buy",
}

const Exchange: React.FC<IProps> = () => {
    const { currentWallet, connectWallet, chains, signer: wagmiSigner, networkId, provider } = useWallet();
    const { switchNetworkAsync } = useSwitchNetwork();
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const connectorId = useAppSelector((state) => state.settings.connectorId);
    const [chainId, setChainId] = React.useState<number>(defaultChainId);
    const { data: signer } = useSigner({
        chainId,
    });

    const [params, setSearchParams] = useSearchParams();
    const { reloadBalances } = useBalances();

    const { lightMode } = useApp();
    const websocketProvider = useWebSocketProvider();
    const [tab, setTab] = React.useState<Tab>(Tab.Buy);

    // Reload Balances every time this component unmounts
    React.useEffect(() => reloadBalances, []);

    // Check for query params regarding tab, if none, default = Buy
    React.useEffect(() => {
        let tab = params.get("tab");
        if (tab) setTab(tab as Tab);
        else
            setSearchParams((params) => {
                params.set("tab", Tab.Buy);
                return params;
            });
    }, [params]);

    const handleBridgeNetworkChange = async () => {
        try {
            console.log("network changted");
            if (networkId === chainId || !connectorId) return;
            try {
                await disconnectAsync();
            } catch {}
            let connector: any;
            let projectId = chainId === defaultChainId ? ZERODEV_PROJECT_ID : ZERODEV_PROJECT_ID_MAINNET;
            switch (connectorId) {
                case "github":
                    connector = githubWallet({ options: { projectId } });
                    break;
                case "google":
                    connector = googleWallet({ options: { projectId } });
                    break;
                case "facebook":
                    connector = facebookWallet({ options: { projectId } });
                    break;
                case "discord":
                    connector = discordWallet({ options: { projectId } });
                    break;
                case "twitch":
                    connector = twitchWallet({ options: { projectId } });
                    break;
                case "twitter":
                    connector = twitterWallet({ options: { projectId } });
                    break;
                default:
                    switchNetworkAsync && (await switchNetworkAsync(chainId));
                    return;
            }
            console.log(connector);
            let created = connector.createConnector();
            console.log(created);
            await connectAsync(created);
        } catch (err: any) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (tab === Tab.Bridge) handleBridgeNetworkChange();
        }, 3000);
        return () => {
            clearTimeout(timeout);
        };
    }, [currentWallet, chainId, signer, tab, connectorId, networkId]);

    React.useEffect(() => {
        if (tab !== Tab.Bridge) {
            setChainId(defaultChainId);
        }
    }, [tab]);

    console.log(wagmiSigner, provider);

    return (
        <div
            style={{
                padding: "20px 8px 120px 8px",
                overflow: "auto",
                gridTemplateRows: "553px",
                height: "100%",
            }}
        >
            <Tabs>
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Buy);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Buy);
                            return params;
                        });
                    }}
                    description="Buy"
                    active={tab === Tab.Buy}
                />
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Bridge);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Bridge);
                            return params;
                        });
                    }}
                    description="Bridge"
                    active={tab === Tab.Bridge}
                />
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Swap);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Swap);
                            return params;
                        });
                    }}
                    description="Swap"
                    active={tab === Tab.Swap}
                />
            </Tabs>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
                {tab === Tab.Buy && (
                    <div className={styles.darkBuy}>
                        {/* <div style={{ width: 375, height: 667 }} ref={containerRef}></div> */}
                        <iframe
                            height="625"
                            title="Transak On/Off Ramp Widget"
                            src={`https://global.transak.com/?apiKey=${RAMP_TRANSAK_API_KEY}&defaultCryptoCurrency=ETH&defaultFiatAmount=500&disableWalletAddressForm=true&network=arbitrum&walletAddress=${currentWallet}`}
                            frameBorder={"no"}
                            allowTransparency={true}
                            allowFullScreen={true}
                            style={{ display: "block", width: "100%", maxHeight: "625px", maxWidth: "500px" }}
                        ></iframe>
                    </div>
                )}
                {tab === Tab.Bridge && SOCKET_API_KEY && (
                    <Bridge
                        provider={wagmiSigner?.provider}
                        onSourceNetworkChange={(network) => {
                            setChainId(network.chainId);
                        }}
                        onBridgeSuccess={reloadBalances}
                        API_KEY={SOCKET_API_KEY}
                        defaultSourceToken={"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"}
                        defaultDestToken={"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"}
                        // enableSameChainSwaps
                        singleTxOnly
                        // enableRefuel
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
                        defaultSourceNetwork={defaultChainId}
                        defaultDestNetwork={1}
                        sourceNetworks={[1, defaultChainId]}
                        destNetworks={[1, defaultChainId]}
                        customize={lightMode ? lightSocketTheme : darkSocketTheme}
                    />
                )}
                {tab === Tab.Swap && SOCKET_API_KEY && (
                    <SwapWidget
                        theme={
                            lightMode
                                ? {
                                      ...lightTheme,
                                      //   accent: "#08a7c7",
                                      //   accentSoft: "#63cce0",
                                      accent: "#63cce0",
                                      accentSoft: "#dcf9ff",
                                      networkDefaultShadow: "rgba(99, 204, 224,0.1)",
                                  }
                                : { ...darkTheme, accent: "#63cce0", accentSoft: "#dcf9ff" }
                        }
                        // @ts-ignore
                        provider={wagmiSigner.zdProvider}
                        onConnectWalletClick={connectWallet}
                        onTxSuccess={reloadBalances}
                        tokenList={uniswapTokens}
                        permit2={true}
                    />
                )}
            </div>
        </div>
    );
};

export default Exchange;
