import React from "react";
import { SwapWidget, Theme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import useWallet from "src/hooks/useWallet";

interface IProps {}

const theme: Theme = {};

const Exchange: React.FC<IProps> = () => {
    const { provider } = useWallet();
    return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
            <SwapWidget theme={theme} provider={provider} />
        </div>
    );
};

export default Exchange;
