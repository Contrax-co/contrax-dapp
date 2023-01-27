import React from "react";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { useWebSocketProvider } from "wagmi";

interface IProps {}

const Exchange: React.FC<IProps> = () => {
    const { connectWallet } = useWallet();
    const { lightMode } = useApp();
    const provider = useWebSocketProvider();
    return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
            <SwapWidget
                theme={lightMode ? lightTheme : darkTheme}
                provider={provider}
                onConnectWalletClick={connectWallet}
            />
        </div>
    );
};

export default Exchange;
