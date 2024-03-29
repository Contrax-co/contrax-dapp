import { useState, useEffect } from "react";
import useWallet from "./useWallet";
import { FrontConnection, FrontPayload, createFrontConnection } from "@front-finance/link";
import { executeTransfer, getCatalogLink, getHoldings, getLinkToken } from "src/api/front";
import { dismissNotify, notifyLoading, notifySuccess } from "src/api/notify";
import useBalances from "src/hooks/useBalances";
import { notifyError } from "src/api/notify";
import { FRONT_CLIENT_ID } from "src/config/constants";
import { Link, LinkPayload, TransferFinishedPayload, createLink } from "@meshconnect/web-link-sdk";

const useFront = (mfa?: string) => {
    const { currentWallet } = useWallet();
    const [loading, setLoading] = useState(false);
    const [frontConnection, setFrontConnection] = useState<Link | null>(null);
    const [iframeLink, setIframLink] = useState<string>();
    const [authData, setAuthData] = useState<FrontPayload>();
    const { reloadBalances } = useBalances();
    const [holdings, setHoldings] = useState<
        {
            chainId: number;
            address: string;
            symbol: string;
            decimals: number;
            balance: number;
            logo: string;
        }[]
    >([]);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [transferSymbol, setTransferSymbol] = useState("");

    const handleTransfer = async (symbol: string = transferSymbol) => {
        if (!symbol) return;
        const holding = holdings.find((holding) => holding.symbol === symbol);
        if (!authData?.accessToken || !holding) return;
        const args = {
            authToken: authData.accessToken.accountTokens[0].accessToken,
            data: "Transfer",
            type: authData.accessToken.brokerType,
            fee: 0,
            chain: holding.chainId === 1 ? "ETH" : "POLYGON",
            symbol,
            targetAddress: currentWallet,
            chainId: holding.chainId,
            amount: holding.balance,
            mfaCode: mfa,
        };
        setLoading(true);
        const notiId = notifyLoading({ title: "Transfer", message: "Transfer in progress" });
        const { status } = await executeTransfer({ ...args });
        if (status === "success") notifySuccess({ title: "Success", message: "Transfer Success" });
        else {
            notifyError({ title: "Failed", message: status });
        }
        if (status === "mfaRequired") {
            setTransferSymbol(symbol);
            setMfaRequired(true);
        } else {
            setMfaRequired(false);
            setTransferSymbol("");
        }
        dismissNotify(notiId);
        setLoading(false);
    };

    const handleCreateConnection = async () => {
        setLoading(true);
        // const url = await getCatalogLink(currentWallet);
        // setIframLink(url);
        const connection = createLink({
            clientId: FRONT_CLIENT_ID,
            onIntegrationConnected(payload) {
                console.log("payload =>", payload);
                setLoading(false);
                const accessToken = payload.accessToken?.accountTokens[0].accessToken;
                if (accessToken) {
                    setAuthData(payload);
                    let expiresAt = 0;
                    if (payload.accessToken?.expiresInSeconds) {
                        expiresAt = Date.now() + payload.accessToken.expiresInSeconds * 1000;
                    }
                    localStorage.setItem("front-auth-data", JSON.stringify({ ...payload, expiresAt }));
                } else {
                    setAuthData(undefined);
                    localStorage.removeItem("front-access-token");
                }
            },
            onExit: (error?: string) => {
                if (error) {
                    console.error(`[FRONT ERROR] ${error}`);
                    // localStorage.removeItem("front-access-token");
                }

                console.info("[FRONT EXIT]");
            },
            onTransferFinished: (data) => {
                console.info("[FRONT TRANSFER SUCCESS]", data);
                if (data.status === "success") {
                    notifySuccess({
                        title: "Transfer Success",
                        message: "it may take few minutes for tokens to be visible",
                    });
                } else {
                    notifyError({
                        title: "Transfer Failed",
                        message: data.errorMessage || "Something went wrong!",
                    });
                }
                reloadBalances();
            },
        });
        const linkToken = await getLinkToken(currentWallet);
        console.log("linkToken =>", linkToken);
        // @ts-ignore
        connection.openLink(linkToken!);
    };

    useEffect(() => {
        setFrontConnection(
            createLink({
                clientId: FRONT_CLIENT_ID,
                onIntegrationConnected: (authData) => {
                    console.info("[FRONT SUCCESS]", authData);
                    // const accessToken = authData.accessToken?.accountTokens[0].accessToken;
                    // if (accessToken) {
                    //     setAuthData(authData);
                    //     let expiresAt = 0;
                    //     if (authData.accessToken?.expiresInSeconds) {
                    //         expiresAt = Date.now() + authData.accessToken.expiresInSeconds * 1000;
                    //     }
                    //     localStorage.setItem("front-auth-data", JSON.stringify({ ...authData, expiresAt }));
                    // } else {
                    //     setAuthData(undefined);
                    //     localStorage.removeItem("front-access-token");
                    // }
                },
                onExit: (error?: string) => {
                    if (error) {
                        console.error(`[FRONT ERROR] ${error}`);
                        // localStorage.removeItem("front-access-token");
                    }

                    console.info("[FRONT EXIT]");
                },
                onTransferFinished: (data) => {
                    console.info("[FRONT TRANSFER SUCCESS]", data);
                    if (data.status === "success") {
                        notifySuccess({
                            title: "Transfer Success",
                            message: "it may take few minutes for tokens to be visible",
                        });
                    } else {
                        notifyError({
                            title: "Transfer Failed",
                            message: data.errorMessage || "Something went wrong!",
                        });
                    }
                    reloadBalances();
                },
            })
        );
    }, []);

    // useEffect(() => {
    //     const authData = localStorage.getItem("front-auth-data");
    //     const isExpired =
    //         authData && JSON.parse(authData).expiresAt ? JSON.parse(authData).expiresAt < Date.now() : false;
    //     if (authData && !isExpired) {
    //         setAuthData(JSON.parse(authData));
    //     } else {
    //         setAuthData(undefined);
    //         localStorage.removeItem("front-auth-data");
    //     }
    // }, []);

    // useEffect(() => {
    //     if (authData?.accessToken?.accountTokens[0].accessToken && authData?.accessToken?.brokerType) {
    //         getHoldings(
    //             authData?.accessToken?.accountTokens[0].accessToken,
    //             authData?.accessToken?.brokerType,
    //             currentWallet
    //         ).then((res) => {
    //             setHoldings(res);
    //         });
    //     } else {
    //         setHoldings([]);
    //     }
    // }, [authData, currentWallet]);

    return { loading, mfaRequired, handleTransfer, holdings, handleCreateConnection, authData, iframeLink };
};

export default useFront;
