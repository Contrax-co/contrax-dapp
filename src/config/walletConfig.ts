import { useMemo } from "react";
import { arbitrum, mainnet, polygon, optimism, linea, bsc, base, Chain } from "viem/chains";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { ALCHEMY_KEY, POLLING_INTERVAL, walletConnectProjectId, WEB3AUTH_CLIENT_ID } from "./constants";
// import { Web3Auth } from "@web3auth/modal";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { providers } from "ethers";
import { PublicClient, WalletClient, defineChain, http, type HttpTransport } from "viem";
import { connectorsForWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import googleIcon from "./../assets/images/google-logo.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
import twitterIcon from "./../assets/images/twitter-icon.svg";
import {
    injectedWallet,
    rainbowWallet,
    walletConnectWallet,
    braveWallet,
    coinbaseWallet,
    metaMaskWallet,
    safeWallet,
    argentWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, createConnector as createWagmiConnector } from "wagmi";

Object.assign(arbitrum.rpcUrls, {
    alchemy: {
        http: ["https://arb-mainnet.g.alchemy.com/v2/" + ALCHEMY_KEY],
    },
});
Object.assign(mainnet.rpcUrls, {
    alchemy: {
        http: ["https://eth-mainnet.g.alchemy.com/v2/" + ALCHEMY_KEY],
    },
});
Object.assign(polygon.rpcUrls, {
    alchemy: {
        http: ["https://polygon-mainnet.g.alchemy.com/v2/" + ALCHEMY_KEY],
    },
});
Object.assign(optimism.rpcUrls, {
    alchemy: {
        http: ["https://opt-mainnet.g.alchemy.com/v2/" + ALCHEMY_KEY],
    },
});
Object.assign(linea.rpcUrls, {
    alchemy: {
        http: ["https://linea-mainnet.g.alchemy.com/v2/" + ALCHEMY_KEY],
    },
});
Object.assign(base.rpcUrls, {
    alchemy: {
        http: ["https://base-mainnet.g.alchemy.com/v2/" + ALCHEMY_KEY],
    },
});

const coreDao = defineChain({
    id: 1116,
    name: "Core Dao",
    nativeCurrency: {
        decimals: 18,
        name: "Core",
        symbol: "CORE",
    },
    rpcUrls: {
        default: { http: ["https://rpcar.coredao.org "] },
    },
    blockExplorers: {
        default: {
            name: "CoreDao",
            url: "https://scan.coredao.org",
        },
    },
    contracts: {
        multicall3: {
            address: "0xcA11bde05977b3631167028862bE2a173976CA11",
            blockCreated: 11_907_934,
        },
    },
    testnet: false,
});

export const SupportedChains = [arbitrum, mainnet, polygon, optimism, linea, bsc, base, coreDao] as (Chain & {
    rpcUrls: { alchemy?: { http: string[] } };
})[];

// #region web3auth config
export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";
const clientId = WEB3AUTH_CLIENT_ID as string;

const PrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: {
        chainConfig: {
            chainId: "0x" + arbitrum.id.toString(16),
            rpcTarget: ARBITRUM_MAINNET,
            displayName: arbitrum.name,
            tickerName: arbitrum.nativeCurrency.name,
            ticker: arbitrum.nativeCurrency.symbol,
            blockExplorerUrl: "https://arbiscan.io/",
            chainNamespace: CHAIN_NAMESPACES.EIP155,
        },
    },
});

// Instantiating Web3Auth
export const web3AuthInstance = new Web3AuthNoModal({
    clientId,
    web3AuthNetwork: "cyan",
    chainConfig: {
        chainId: "0x" + arbitrum.id.toString(16),
        rpcTarget: ARBITRUM_MAINNET,
        displayName: arbitrum.name,
        tickerName: arbitrum.nativeCurrency.name,
        ticker: arbitrum.nativeCurrency.symbol,
        chainNamespace: CHAIN_NAMESPACES.EIP155,
    },
    // privateKeyProvider: PrivateKeyProvider,
});

const openloginAdapter = new OpenloginAdapter({
    privateKeyProvider: PrivateKeyProvider,
    // sessionTime: 604800,
    adapterSettings: {
        // sessionTime: 604800,
        network: "cyan",
        uxMode: "redirect",
        replaceUrlOnRedirect: false,
    },
});
web3AuthInstance.configureAdapter(openloginAdapter);

getDefaultExternalAdapters({
    options: {
        clientId,
        web3AuthNetwork: "cyan",
        privateKeyProvider: PrivateKeyProvider,
        chainConfig: {
            chainId: "0x" + arbitrum.id.toString(16),
            rpcTarget: ARBITRUM_MAINNET,
            displayName: arbitrum.name,
            tickerName: arbitrum.nativeCurrency.name,
            ticker: arbitrum.nativeCurrency.symbol,
            blockExplorerUrl: "https://arbiscan.io/",
            chainNamespace: CHAIN_NAMESPACES.EIP155,
        },
    },
}).then((adapters) => {
    adapters.forEach((adapter) => {
        web3AuthInstance.configureAdapter(adapter);
    });
});

export const web3authProvider = web3AuthInstance.provider;

// #endregion web3auth config

export const rainbowConfig = getDefaultConfig({
    appName: "Contrax",
    projectId: walletConnectProjectId,
    chains: SupportedChains as [Chain, ...Chain[]],
    transports: SupportedChains.reduce((acc, curr) => {
        acc[curr.id] = http(curr.rpcUrls?.alchemy?.http[0]);
        return acc;
    }, {} as { [key: number]: HttpTransport }),
    wallets: [
        {
            groupName: "Socials",
            wallets: [
                () => {
                    return {
                        id: "google",
                        name: "Google",
                        iconUrl: googleIcon,
                        installed: true,
                        downloadUrls: {},
                        iconBackground: "white",
                        createConnector: (walletDetails) =>
                            createWagmiConnector((config) => ({
                                ...Web3AuthConnector({
                                    web3AuthInstance,
                                    loginParams: {
                                        loginProvider: "google",
                                    },
                                })(config),
                                ...walletDetails,
                            })),
                    };
                },
                () => {
                    return {
                        id: "facebook",
                        name: "Facebook",
                        iconUrl: facebookIcon,
                        iconBackground: "white",
                        createConnector: (walletDetails) =>
                            createWagmiConnector((config) => ({
                                ...Web3AuthConnector({
                                    web3AuthInstance,
                                    loginParams: {
                                        loginProvider: "facebook",
                                    },
                                })(config),
                                ...walletDetails,
                            })),
                    };
                },
                () => {
                    return {
                        id: "discord",
                        name: "Discord",
                        iconUrl: discordIcon,
                        iconBackground: "white",
                        createConnector: (walletDetails) =>
                            createWagmiConnector((config) => ({
                                ...Web3AuthConnector({
                                    web3AuthInstance,
                                    loginParams: {
                                        loginProvider: "discord",
                                    },
                                })(config),
                                ...walletDetails,
                            })),
                    };
                },
                () => {
                    return {
                        id: "twitter",
                        name: "Twitter",
                        iconUrl: twitterIcon,
                        iconBackground: "white",
                        createConnector: (walletDetails) =>
                            createWagmiConnector((config) => ({
                                ...Web3AuthConnector({
                                    web3AuthInstance,
                                    loginParams: {
                                        loginProvider: "twitter",
                                    },
                                })(config),
                                ...walletDetails,
                            })),
                    };
                },
                () => {
                    return {
                        id: "github",
                        name: "Github",
                        iconUrl: githubIcon,
                        iconBackground: "white",
                        createConnector: (walletDetails) =>
                            createWagmiConnector((config) => ({
                                ...Web3AuthConnector({
                                    web3AuthInstance,
                                    loginParams: {
                                        loginProvider: "github",
                                    },
                                })(config),
                                ...walletDetails,
                            })),
                    };
                },
            ],
        },
        {
            groupName: "Wallets",
            wallets: [
                injectedWallet,
                rainbowWallet,
                walletConnectWallet,
                braveWallet,
                coinbaseWallet,
                metaMaskWallet,
                safeWallet,
                argentWallet,
            ],
        },
    ],
});

export function walletClientToWeb3Provider(walletClient: WalletClient) {
    const { account, chain, transport } = walletClient;
    const network = {
        chainId: chain?.id ?? arbitrum.id,
        name: chain?.name ?? arbitrum.name,
        ensAddress: chain?.contracts?.ensRegistry?.address,
    };
    const provider = new providers.Web3Provider(transport, network);
    provider.pollingInterval = POLLING_INTERVAL;
    return provider;
}

/** Hook to convert a viem Wallet Client to an ethers.js Web3Provider. */
export function useEthersWeb3Provider(walletClient?: WalletClient) {
    return useMemo(() => (walletClient ? walletClientToWeb3Provider(walletClient) : undefined), [walletClient]);
}
