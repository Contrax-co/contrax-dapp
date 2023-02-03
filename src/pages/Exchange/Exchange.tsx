import React from "react";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { Bridge } from "@socket.tech/plugin";
import { defaultChainId, SOCKET_API_KEY } from "src/config/constants";

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

const Exchange: React.FC<IProps> = () => {
    const { signer } = useWallet();
    const { lightMode } = useApp();

    return (
        <div
            style={{
                paddingTop: 20,
                overflow: "auto",
                gridTemplateRows: "553px",
                display: "grid",
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 20,
            }}
        >
            {SOCKET_API_KEY ? (
                <Bridge
                    provider={signer?.provider}
                    API_KEY={SOCKET_API_KEY}
                    enableRefuel
                    enableSameChainSwaps
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
                    defaultDestNetwork={defaultChainId}
                    customize={lightMode ? lightSocketTheme : darkSocketTheme}
                />
            ) : (
                "API Key not found"
            )}
        </div>
    );
};

export default Exchange;
