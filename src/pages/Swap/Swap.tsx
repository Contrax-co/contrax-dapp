import React, { useState } from "react";
import uniswapTokens from "./uniswapTokens.json";
import useWallet from "src/hooks/useWallet";
import useBalances from "src/hooks/useBalances";
import useApp from "src/hooks/useApp";
import { SwapWidget, darkTheme, lightTheme } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import "./Swap.css";
import { getEip1193Provider } from "src/utils/Eip1193Provider";
// import TokenList from "@uniswap/default-token-list";
import { Address, erc20Abi, maxUint256, zeroAddress, getContract } from "viem";
import { awaitTransaction } from "src/utils/common";
import { CHAIN_ID } from "src/types/enums";
import { IClients } from "src/types";

interface IProps {}

const Swap: React.FC<IProps> = () => {
    const { isSocial, currentWallet, getClients, externalChainId, estimateTxGas } = useWallet();
    const { reloadBalances } = useBalances();
    const { lightMode } = useApp();
    const [inputToken, setInputToken] = useState<Address>(zeroAddress);
    const [provider, setProvider] = useState<Awaited<ReturnType<typeof getEip1193Provider>>>();
    const [client, setClient] = useState<IClients>();

    React.useEffect(() => {
        reloadBalances();
        getClients(CHAIN_ID.ARBITRUM).then(async (client) => {
            setClient(client);
            setProvider(getEip1193Provider(client, estimateTxGas));
        });
    }, [externalChainId]);

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
                            const bal = await client!.public.readContract({
                                abi: erc20Abi,
                                address: inputToken,
                                functionName: "balanceOf",
                                args: [currentWallet],
                            });
                            const allowance = await client!.public.readContract({
                                abi: erc20Abi,
                                address: inputToken,
                                functionName: "allowance",
                                args: [currentWallet, v2Router],
                            });
                            if (allowance < bal) {
                                const _contract = getContract({
                                    abi: erc20Abi,
                                    address: inputToken,
                                    client: client!,
                                });
                                // @ts-ignore
                                await awaitTransaction(_contract.write.approve([v2Router, maxUint256], {}), client);
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
