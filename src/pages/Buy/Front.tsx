import React from "react";
import styles from "./Buy.module.scss";
import useWallet from "src/hooks/useWallet";
import { FrontConnection, FrontPayload, createFrontConnection } from "@front-finance/link";
import { FRONT_CLIENT_ID } from "src/config/constants";
import useApp from "src/hooks/useApp";
import { getCatalogLink, getHoldings } from "src/api/front";
import { notifySuccess } from "src/api/notify";
import { notifyError } from "src/api/notify";
import useBalances from "src/hooks/useBalances";

interface IProps {}

const Front: React.FC<IProps> = () => {
    const { lightMode } = useApp();
    const { currentWallet } = useWallet();
    const [frontConnection, setFrontConnection] = React.useState<FrontConnection | null>(null);
    const [iframeLink, setIframLink] = React.useState<string>();
    const [authData, setAuthData] = React.useState<FrontPayload>();
    const [holdings, setHoldings] = React.useState<{ symbol: string; amount: number }[]>([]);
    const { reloadBalances } = useBalances();

    React.useEffect(() => {
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

    React.useEffect(() => {
        if (iframeLink) {
            frontConnection?.openPopup(iframeLink);
        }

        return () => {
            if (iframeLink) {
                frontConnection?.closePopup();
            }
        };
    }, [frontConnection, iframeLink]);

    React.useEffect(() => {
        const authData = localStorage.getItem("front-auth-data");
        if (authData) {
            setAuthData(JSON.parse(authData));
        }
    }, []);

    React.useEffect(() => {
        if (authData?.accessToken?.accountTokens[0].accessToken && authData?.accessToken?.brokerType) {
            getHoldings(authData?.accessToken?.accountTokens[0].accessToken, authData?.accessToken?.brokerType).then(
                (res) => {
                    console.log(res);
                    if (res?.cryptocurrencyPositions) setHoldings(res?.cryptocurrencyPositions);
                }
            );
        }
    }, [authData]);

    const handleCreateConnection = async () => {
        const url = await getCatalogLink(currentWallet);
        setIframLink(url);
    };

    return (
        <div>
            <button onClick={handleCreateConnection} className={`custom-button ${lightMode && "custom-button-light"}`}>
                Create Connection
            </button>

            <div>
                {holdings.map((holding) => (
                    <div key={holding.symbol} className="center" style={{ gap: 50 }}>
                        <div>{holding.symbol}</div>
                        <div>{holding.amount}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Front;
