import { useState, useEffect } from "react";
import useWallet from "./useWallet";
import { FrontConnection, FrontPayload, createFrontConnection } from "@front-finance/link";
import { executeTransfer, getCatalogLink, getHoldings } from "src/api/front";
import { dismissNotify, notifyLoading, notifySuccess } from "src/api/notify";
import useBalances from "src/hooks/useBalances";
import { notifyError } from "src/api/notify";
import { FRONT_CLIENT_ID } from "src/config/constants";

const useFront = () => {
    const { currentWallet } = useWallet();
    const [loading, setLoading] = useState(false);
    const [frontConnection, setFrontConnection] = useState<FrontConnection | null>(null);
    const [iframeLink, setIframLink] = useState<string>();
    const [authData, setAuthData] = useState<FrontPayload>();
    const { reloadBalances } = useBalances();
    const [holdings, setHoldings] = useState<
        {
            chainId: number;
            address: string;
            symbol: string;
            decimals: number;
            networkId: string;
            balance: number;
            usdAmount: number;
        }[]
    >([]);

    const handleTransfer = async (symbol: string) => {
        const holding = holdings.find((holding) => holding.symbol === symbol);
        if (!authData?.accessToken || !holding) return;
        const args = {
            fromAuthToken: authData.accessToken.accountTokens[0].accessToken,
            fromType: authData.accessToken.brokerType,
            networkId: holding.networkId,
            symbol,
            toAddress: currentWallet,
            amount: holding.balance,
        };
        setLoading(true);
        const notiId = notifyLoading({ title: "Transfer", message: "Transfer in progress" });
        const status = await executeTransfer(args);
        if (status) notifySuccess({ title: "Success", message: "Transfer Success" });
        else {
            notifyError({ title: "Failed", message: "Transfer Failed" });
        }
        dismissNotify(notiId);
        setLoading(false);
    };

    const handleCreateConnection = async () => {
        setLoading(true);
        const url = await getCatalogLink(currentWallet);
        setIframLink(url);
        setLoading(false);
    };

    useEffect(() => {
        setFrontConnection(
            createFrontConnection({
                clientId: FRONT_CLIENT_ID,
                onBrokerConnected: (authData) => {
                    console.info("[FRONT SUCCESS]", authData);
                    const accessToken = authData.accessToken?.accountTokens[0].accessToken;
                    if (accessToken) {
                        setAuthData(authData);
                        localStorage.setItem("front-auth-data", JSON.stringify(authData));
                    } else {
                        setAuthData(undefined);
                        localStorage.removeItem("front-access-token");
                    }
                },
                onExit: (error?: string) => {
                    if (error) {
                        console.error(`[FRONT ERROR] ${error}`);
                        localStorage.removeItem("front-access-token");
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

    useEffect(() => {
        if (iframeLink) {
            frontConnection?.openPopup(iframeLink);
        }

        return () => {
            if (iframeLink) {
                frontConnection?.closePopup();
            }
        };
    }, [frontConnection, iframeLink]);

    useEffect(() => {
        const authData = localStorage.getItem("front-auth-data");
        if (authData) {
            setAuthData(JSON.parse(authData));
        }
    }, []);

    useEffect(() => {
        if (authData?.accessToken?.accountTokens[0].accessToken && authData?.accessToken?.brokerType) {
            getHoldings(
                authData?.accessToken?.accountTokens[0].accessToken,
                authData?.accessToken?.brokerType,
                currentWallet
            ).then((res) => {
                setHoldings(res);
            });
        } else {
            setHoldings([]);
        }
    }, [authData, currentWallet]);

    return { loading, handleTransfer, holdings, handleCreateConnection, authData };
};

export default useFront;
