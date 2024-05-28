import React, { useMemo, useState } from "react";
import uniswapTokens from "./uniswapTokens.json";
import useWallet from "src/hooks/useWallet";
import useBalances from "src/hooks/useBalances";
import useApp from "src/hooks/useApp";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import "./Swap.css";
import { getEip1193Provider } from "src/utils/Eip1193Provider";
// import TokenList from "@uniswap/default-token-list";
import { Address, erc20Abi, maxUint256, zeroAddress } from "viem";
import { awaitTransaction } from "src/utils/common";

interface IProps {}

const Swap: React.FC<IProps> = () => {
    const { isSocial, client, currentWallet } = useWallet();
    const { reloadBalances } = useBalances();
    const { lightMode } = useApp();
    const [inputToken, setInputToken] = useState<Address>(zeroAddress);

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
                permit2={isSocial ? false : true}
                onReviewSwapClick={() => {
                    (async function () {
                        if (isSocial && currentWallet && inputToken !== zeroAddress) {
                            const v2Router = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
                            const bal = await client.public.readContract({
                                abi: erc20Abi,
                                address: inputToken,
                                functionName: "balanceOf",
                                args: [currentWallet],
                            });
                            const allowance = await client.public.readContract({
                                abi: erc20Abi,
                                address: inputToken,
                                functionName: "allowance",
                                args: [currentWallet, v2Router],
                            });
                            if (allowance < bal) {
                                await awaitTransaction(
                                    client.wallet.writeContract({
                                        abi: erc20Abi,
                                        address: inputToken,
                                        functionName: "approve",
                                        args: [v2Router, maxUint256],
                                    }),
                                    client
                                );
                            }
                        }
                    })();
                }}
                onInitialSwapQuote={(trade) => {
                    setInputToken(
                        trade.routes[0].input.isNative ? zeroAddress : (trade.routes[0].input.address as Address)
                    );
                }}
            />
        </div>
    );
};

export default Swap;
