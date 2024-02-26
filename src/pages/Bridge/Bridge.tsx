import React from "react";
import { Bridge as SocketBridge } from "@socket.tech/plugin";
import useApp from "src/hooks/useApp";
import useBalances from "src/hooks/useBalances";
import useWallet from "src/hooks/useWallet";
import { useEthersSigner } from "src/config/walletConfig";
import { SOCKET_BRIDGE_KEY, defaultChainId } from "src/config/constants";
import { getWeb3AuthProvider } from "src/config/walletConfig";
import "./Bridge.css";

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

const Bridge = () => {
    const { reloadBalances } = useBalances();
    const { lightMode } = useApp();
    const { currentWallet, chains } = useWallet();
    const [chainId, setChainId] = React.useState<number>(defaultChainId);
    const signer = useEthersSigner({
        chainId,
    });
    const [provider, setProvider] = React.useState<any>();
    const [isWeb3Auth, setIsWeb3Auth] = React.useState(false);

    const handleBridgeNetworkChange = async () => {
        try {
            // @ts-ignore
            const pkey = await signer?.provider?.provider?.request({ method: "eth_private_key" });
            if (!pkey) {
                setIsWeb3Auth(true);
                setProvider(undefined);
                return;
            }
            const chain = chains.find((c) => c.id === chainId);
            const _provider = await getWeb3AuthProvider({
                chainId: chain?.id!,
                blockExplorer: chain?.blockExplorers?.default.url!,
                name: chain?.name!,
                rpc: chain?.rpcUrls.default.http[0]!,
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

    React.useEffect(() => reloadBalances, []);

    if (!SOCKET_BRIDGE_KEY) return null;
    else
        return (
            <div className="BridgeContainer">
                <SocketBridge
                    provider={isWeb3Auth ? provider : signer?.provider}
                    onSourceNetworkChange={(network) => {
                        setChainId(network.chainId);
                    }}
                    onBridgeSuccess={reloadBalances}
                    API_KEY={SOCKET_BRIDGE_KEY}
                    defaultSourceToken={"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"}
                    defaultDestToken={"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"}
                    // enableSameChainSwaps
                    singleTxOnly
                    // enableRefuel
                    // includeBridges={[
                    //     "polygon-bridge",
                    //     "hop",
                    //     "anyswap-router-v4",
                    //     "hyphen",
                    //     "arbitrum-bridge",
                    //     "connext",
                    //     "celer",
                    //     // "across",

                    //     "optimism-bridge",
                    //     "refuel-bridge",
                    // ]}
                    // excludeBridges={[]}
                    defaultSourceNetwork={1}
                    defaultDestNetwork={defaultChainId}
                    // sourceNetworks={[1, 137, defaultChainId]}
                    // destNetworks={[1, 137, defaultChainId]}
                    customize={lightMode ? lightSocketTheme : darkSocketTheme}
                />
            </div>
        );
};

export default Bridge;
