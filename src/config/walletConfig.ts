import { arbitrum, mainnet, avalanche, bsc, optimism, polygon, gnosis, fantom } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { createClient, configureChains } from "wagmi";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import {
    googleWallet,
    facebookWallet,
    githubWallet,
    discordWallet,
    twitchWallet,
    twitterWallet,
} from "@zerodevapp/wagmi/rainbowkit";
import { ZERODEV_PROJECT_ID } from "./constants";

export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";
// export const ARBITRUM_MAINNET = "https://rpc.ankr.com/arbitrum";



// Configure chains & providers with the Alchemy provider.
// Popular providers are Alchemy (alchemy.com), Infura (infura.io), Quicknode (quicknode.com) etc.
export const { chains, provider, webSocketProvider } = configureChains(
    [
        arbitrum,
        mainnet,

        // polygon,
        // optimism, avalanche, gnosis, fantom, bsc
    ],
    [
        jsonRpcProvider({
            rpc: (chain) => ({
                http: chain.rpcUrls.default.http[0],
                webSocket: chain.rpcUrls?.default?.webSocket && chain.rpcUrls?.default?.webSocket[0],
            }),
        }),

        publicProvider(),
    ]
);

const { wallets } = getDefaultWallets({
    appName: "Contrax",
    chains,
});

const connectors = connectorsForWallets([
    {
        groupName: "Social",
        wallets: [
            googleWallet({ options: { projectId: ZERODEV_PROJECT_ID } }),
            facebookWallet({ options: { projectId: ZERODEV_PROJECT_ID } }),
            githubWallet({ options: { projectId: ZERODEV_PROJECT_ID } }),
            discordWallet({ options: { projectId: ZERODEV_PROJECT_ID } }),
            twitchWallet({ options: { projectId: ZERODEV_PROJECT_ID } }),
            twitterWallet({ options: { projectId: ZERODEV_PROJECT_ID } }),
        ],
    },
    ...wallets,
]);
export const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
    webSocketProvider,
});
