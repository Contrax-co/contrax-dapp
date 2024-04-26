import React from "react";
import uniswapTokens from "./uniswapTokens.json";
import useWallet from "src/hooks/useWallet";
import useBalances from "src/hooks/useBalances";
import useApp from "src/hooks/useApp";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import "./Swap.css";
import { getEip1193Provider } from "src/utils/Eip1193Provider";

interface IProps {}

const Swap: React.FC<IProps> = () => {
    const { connectWallet, client } = useWallet();
    const { reloadBalances } = useBalances();
    const { lightMode } = useApp();

    React.useEffect(() => reloadBalances, []);

    return (
        <div className="SwapContainer">
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
                provider={getEip1193Provider(client)}
                onConnectWalletClick={connectWallet}
                onTxSuccess={reloadBalances}
                tokenList={uniswapTokens}
                permit2={true}
            />
        </div>
    );
};

export default Swap;
