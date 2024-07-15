import { useState } from "react";
import useWallet from "./useWallet";
import { FrontPayload } from "@front-finance/link";
import { getLinkToken } from "src/api/front";
import { notifySuccess } from "src/api/notify";
import useBalances from "src/hooks/useBalances";
import { notifyError } from "src/api/notify";
import { FRONT_CLIENT_ID } from "src/config/constants";
import { createLink } from "@meshconnect/web-link-sdk";

const useFront = () => {
    const { currentWallet } = useWallet();
    const [loading, setLoading] = useState(false);
    const [authData, setAuthData] = useState<FrontPayload>();
    const { reloadBalances } = useBalances();
    const handleCreateConnection = async () => {
        if (!currentWallet) {
            notifyError({ title: "Wallet not conencted", message: "" });
            return;
        }
        setLoading(true);
        const connection = createLink({
            clientId: FRONT_CLIENT_ID,
            onIntegrationConnected(payload) {
                console.log("payload =>", payload);
                setLoading(false);
            },
            onExit: (error?: string) => {
                if (error) {
                    console.error(`[FRONT ERROR] ${error}`);
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
                        // @ts-ignore
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

    return {
        loading,
        handleCreateConnection,
        authData,
    };
};

export default useFront;
