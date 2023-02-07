import React, { useRef } from "react";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { Bridge } from "@socket.tech/plugin";
import { defaultChainId, SOCKET_API_KEY } from "src/config/constants";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

import PoolButton from "src/components/PoolButton/PoolButton";
import { SwapWidget, darkTheme, lightTheme, TokenInfo } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import styles from "./Exchange.module.scss";
import { useSigner, useWebSocketProvider } from "wagmi";
import { getWeb3AuthProvider } from "src/config/walletConfig";
import useFarms from "src/hooks/farms/useFarms";

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
    const { currentWallet, connectWallet, chains, switchNetworkAsync, signer: wagmiSigner } = useWallet();
    const [chainId, setChainId] = React.useState<number>(1);
    const { data: signer } = useSigner({
        chainId,
    });

    const { lightMode } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const [provider, setProvider] = React.useState<any>();
    const websocketProvider = useWebSocketProvider();
    const [tab, setTab] = React.useState<Tab>(Tab.Bridge);
    const [isWeb3Auth, setIsWeb3Auth] = React.useState(false);
    const { farms } = useFarms();
    const tokenList: TokenInfo[] = React.useMemo(
        () =>
            farms.map((farm) => {
                const obj: TokenInfo = {
                    address: farm.token1,
                    chainId: 42161,
                    decimals: farm.decimals,
                    name: farm.name.split("-")[0],
                    symbol: farm.name.split("-")[0],
                };
                console.log(obj);
                return obj;
            }),
        [farms]
    );
    React.useEffect(() => {
        if (tab === Tab.Onramp) {
            const ramp = new RampInstantSDK({
                userAddress: currentWallet,
                defaultAsset: "ARBITRUM_ETH",
                fiatValue: "500",
                fiatCurrency: "USD",
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

    const handleBridgeNetworkChange = async () => {
        try {
            // switchNetworkAsync && (await switchNetworkAsync(chainId));
            // return;
            // @ts-ignore
            const pkey = await signer?.provider?.provider?.request({ method: "eth_private_key" });

            if (!pkey) {
                setIsWeb3Auth(true);
                setProvider(undefined);
                return;
            }
            const chain = chains.find((c) => c.id === chainId);
            console.log("chain", chain, pkey);
            const _provider = await getWeb3AuthProvider({
                chainId: chain?.id!,
                blockExplorer: chain?.blockExplorers?.default.url!,
                name: chain?.name!,
                rpc: chain?.rpcUrls.public.http[0]!,
                ticker: chain?.nativeCurrency.symbol!,
                tickerName: chain?.nativeCurrency.name!,
                pkey,
            });
            setProvider(_provider);
            setIsWeb3Auth(true);
        } catch {
            // switchNetworkAsync && (await switchNetworkAsync(chainId));
            setIsWeb3Auth(false);
        }
    };

    React.useEffect(() => {
        handleBridgeNetworkChange();
    }, [currentWallet, chainId, signer]);

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
                        provider={websocketProvider || wagmiSigner?.provider}
                        onConnectWalletClick={connectWallet}
                        tokenList={tokenList}
                    />
                )}
                {tab === Tab.Bridge && SOCKET_API_KEY && (
                    <Bridge
                        provider={isWeb3Auth ? provider : signer?.provider}
                        onSourceNetworkChange={(network) => {
                            setChainId(network.chainId);
                        }}
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
                        defaultSourceNetwork={1}
                        defaultDestNetwork={defaultChainId}
                        sourceNetworks={[1, defaultChainId]}
                        destNetworks={[1, defaultChainId]}
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
