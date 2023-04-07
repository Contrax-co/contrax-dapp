import json from "src/config/constants/pools.json";
import { utils } from "ethers";
import { getEarnings } from "src/api/farms";
import useWallet from "src/hooks/useWallet";
import { getPricesByTime } from "src/api/token";
import useTotalSupplies from "src/hooks/useTotalSupplies";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useFarms from "src/hooks/farms/useFarms";
import useNotify from "src/hooks/useNotify";
import { mainnet, arbitrum } from "wagmi/chains";
import {
    googleWallet,
    facebookWallet,
    githubWallet,
    discordWallet,
    twitchWallet,
    twitterWallet,
} from "@zerodevapp/wagmi/rainbowkit";
import { useAccount, useConnect, useDisconnect, useSwitchNetwork } from "wagmi";

const Test = () => {
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const { connectAsync } = useConnect();
    const { connector } = useAccount();
    const { switchNetworkAsync } = useSwitchNetwork();
    const { disconnectAsync } = useDisconnect();

    console.log(connector);
    const fn = async () => {
        const mainnetProjectId = "a20aa1ab-79b0-435d-92b9-dad4442af747";
        await disconnectAsync();
        let connector: any;
        switch (connector?.id) {
            case "github":
                connector = githubWallet({ options: { projectId: mainnetProjectId } });
                break;
            case "google":
                connector = googleWallet({ options: { projectId: mainnetProjectId } });
                break;
            case "facebook":
                connector = facebookWallet({ options: { projectId: mainnetProjectId } });
                break;
            case "discord":
                connector = discordWallet({ options: { projectId: mainnetProjectId } });
                break;
            case "twitch":
                connector = twitchWallet({ options: { projectId: mainnetProjectId } });
                break;
            case "twitter":
                connector = twitterWallet({ options: { projectId: mainnetProjectId } });
                break;
            default:
                switchNetworkAsync && (await switchNetworkAsync(1));
                return;
        }

        await connectAsync(connector.createConnector());
    };
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
            <button
                onClick={() => {
                    notifySuccess("Approving Zapping!", "Please wait...a sadasfas fsa fsafsafsaf saf");
                }}
            >
                success long
            </button>
            <button
                onClick={() => {
                    notifySuccess("Approving Zapping!", "Please wait...");
                }}
            >
                success
            </button>
            <button
                onClick={() => {
                    notifyError("Approving Zapping!", "Please wait...");
                }}
            >
                error
            </button>
            <button
                onClick={() => {
                    notifyError(
                        "Approving Zapping!",
                        "Please wait...ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
                    );
                }}
            >
                error long
            </button>
            <button
                onClick={() => {
                    notifyLoading("Approving Zapping!", "Please wait...");
                }}
            >
                loading
            </button>
            <button
                onClick={() => {
                    notifyLoading("Approving Zapping!", "Please wait...", {
                        buttons: [
                            {
                                name: "View",
                                onClick: () => {},
                            },
                        ],
                    });
                }}
            >
                btns
            </button>
            <button
                onClick={() => {
                    dismissNotifyAll();
                }}
            >
                dismiss
            </button>
        </div>
    );
};

export default Test;
