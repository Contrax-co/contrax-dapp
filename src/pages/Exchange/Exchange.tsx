import React from "react";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";

interface IProps {}

const Exchange: React.FC<IProps> = () => {
    const { provider, connectWallet } = useWallet();
    const { lightMode } = useApp();
    return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
            <SwapWidget
                theme={lightMode ? lightTheme : darkTheme}
                // @ts-ignore
                provider={provider}
                onConnectWalletClick={connectWallet}
            />
        </div>
    );
};

export default Exchange;
