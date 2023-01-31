import { arbitrum } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
// import { Web3Auth } from "@web3auth/modal";
import { Web3AuthCore } from "@web3auth/core";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { createClient, WagmiConfig, configureChains } from "wagmi";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, rainbowWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { WEB3AUTH_CLIENT_ID } from "./constants";
import googleIcon from "./../assets/images/google-logo.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";

const clientId = WEB3AUTH_CLIENT_ID as string;

// Configure chains & providers with the Alchemy provider.
// Popular providers are Alchemy (alchemy.com), Infura (infura.io), Quicknode (quicknode.com) etc.
export const { chains, provider, webSocketProvider } = configureChains(
    [arbitrum],
    [
        jsonRpcProvider({
            rpc: (chain) => ({
                http: ARBITRUM_MAINNET,
            }),
        }),

        publicProvider(),
    ]
);
// Instantiating Web3Auth
const web3AuthInstance = new Web3AuthCore({
    clientId,
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x" + chains[0].id.toString(16),
        rpcTarget: "https://arb1.arbitrum.io/rpc",
        displayName: chains[0].name,
        tickerName: chains[0].nativeCurrency?.name,
        ticker: chains[0].nativeCurrency?.symbol,
        blockExplorer: "https://arbiscan.io/",
    },
});

const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
        mfaLevel: "none", // Pass on the mfa level of your choice: default, optional, mandatory, none
    },
    web3AuthNetwork: "cyan",
});
web3AuthInstance.configureAdapter(openloginAdapter);

const { wallets } = getDefaultWallets({
    appName: "Contrax",
    chains,
});

const connectors = connectorsForWallets([
    {
        groupName: "Social",
        wallets: [
            {
                id: "google",
                name: "Google",
                iconUrl: googleIcon,
                iconBackground: "white",
                createConnector: () => {
                    const connector = new Web3AuthConnector({
                        chains,
                        options: {
                            web3AuthInstance,
                            loginParams: {
                                loginProvider: "google",
                            },
                        },
                    });

                    return {
                        connector,
                    };
                },
            },
            {
                id: "Facebook",
                name: "Facebook",
                iconUrl: facebookIcon,
                iconBackground: "white",
                createConnector: () => {
                    const connector = new Web3AuthConnector({
                        chains,
                        options: {
                            web3AuthInstance,
                            loginParams: {
                                loginProvider: "facebook",
                            },
                        },
                    });

                    return {
                        connector,
                    };
                },
            },
            {
                id: "discord",
                name: "Discord",
                iconUrl: discordIcon,
                iconBackground: "white",
                createConnector: () => {
                    const connector = new Web3AuthConnector({
                        chains,
                        options: {
                            web3AuthInstance,
                            loginParams: {
                                loginProvider: "discord",
                            },
                        },
                    });

                    return {
                        connector,
                    };
                },
            },
            {
                id: "github",
                name: "Github",
                iconUrl: githubIcon,
                iconBackground: "white",
                createConnector: () => {
                    const connector = new Web3AuthConnector({
                        chains,
                        options: {
                            web3AuthInstance,
                            loginParams: {
                                loginProvider: "github",
                            },
                        },
                    });

                    return {
                        connector,
                    };
                },
            },
        ],
    },
    ...wallets,
]);
export const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    // connectors: [
    //     new Web3AuthConnector({
    //         chains,
    //         options: {
    //             web3AuthInstance,
    //         },
    //     }),
    //     new InjectedConnector({
    //         chains,
    //         options: {
    //             name: "Injected",
    //             shimDisconnect: true,
    //         },
    //     }),
    // ],
    provider,
    webSocketProvider,
});
