import json from "src/config/constants/pools.json";
import { Contract, Signer, Wallet, providers, constants, ethers, utils, BytesLike } from "ethers";
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
import { erc20ABI, useAccount, useConnect, useDisconnect, useSwitchNetwork } from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { Deferrable, SigningKey } from "ethers/lib/utils.js";
import { GasSponsoredSigner } from "src/utils/gasSponsoredSigner";

const Test = () => {
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const { connectAsync } = useConnect();
    const { connector } = useAccount();
    const { provider, signer, getPkey } = useWallet();
    const { switchNetworkAsync } = useSwitchNetwork();
    const { disconnectAsync } = useDisconnect();
    const addRecentTransaction = useAddRecentTransaction();

    // web3authProvider
    const handleTransaction = async () => {
        const _signer = new GasSponsoredSigner(await getPkey(), provider);
        const contract = new Contract("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", erc20ABI, _signer);
        const tx = await contract.approve("0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8", constants.MaxUint256);
        console.log("tx", tx);
    };

    const fn = async () => {
        // const mainnetProjectId = "a20aa1ab-79b0-435d-92b9-dad4442af747";
        // await disconnectAsync();
        // let connector: any;
        // switch (connector?.id) {
        //     case "github":
        //         connector = githubWallet({ options: { projectId: mainnetProjectId } });
        //         break;
        //     case "google":
        //         connector = googleWallet({ options: { projectId: mainnetProjectId } });
        //         break;
        //     case "facebook":
        //         connector = facebookWallet({ options: { projectId: mainnetProjectId } });
        //         break;
        //     case "discord":
        //         connector = discordWallet({ options: { projectId: mainnetProjectId } });
        //         break;
        //     case "twitch":
        //         connector = twitchWallet({ options: { projectId: mainnetProjectId } });
        //         break;
        //     case "twitter":
        //         connector = twitterWallet({ options: { projectId: mainnetProjectId } });
        //         break;
        //     default:
        //         switchNetworkAsync && (await switchNetworkAsync(1));
        //         return;
        // }
        // await connectAsync(connector.createConnector());
    };
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
            <button
                onClick={() => {
                    addRecentTransaction({
                        hash: "0x272cc8bb28c988f9c73fa2f96dea48aae0f19d8a7e39d16a1d78248cae797a50",
                        description: "Approving Zapping!",
                        confirmations: 100,
                    });
                }}
            >
                Add Tran
            </button>
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
            <button
                onClick={() => {
                    handleTransaction();
                }}
            >
                Approve Transaction
            </button>
        </div>
    );
};

export default Test;
