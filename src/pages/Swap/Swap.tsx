import React, { useMemo } from "react";
import uniswapTokens from "./uniswapTokens.json";
import useWallet from "src/hooks/useWallet";
import useBalances from "src/hooks/useBalances";
import useApp from "src/hooks/useApp";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import "./Swap.css";
import { getEip1193Provider } from "src/utils/Eip1193Provider";
import TokenList from "@uniswap/default-token-list";

interface IProps {}

const Swap: React.FC<IProps> = () => {
    const { connectWallet, client } = useWallet();
    const { reloadBalances } = useBalances();
    const { lightMode } = useApp();

    const provider = useMemo(() => {
        return getEip1193Provider(client);
    }, [client]);

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
                provider={provider}
                // onConnectWalletClick={connectWallet}
                onTxSuccess={reloadBalances}
                tokenList={uniswapTokens}
                // defaultChainId={"42161"}
                // tokenList={TokenList.tokens}
                permit2={false}
            />
        </div>
    );
};

export default Swap;
