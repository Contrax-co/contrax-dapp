import { useMemo } from "react";
import { arbitrum, mainnet, polygon, gnosis, fantom } from "wagmi/chains";

import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ChainProviderFn, WalletClient, configureChains, createConfig, useWalletClient } from "wagmi";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { INFURA_KEY, WEB3AUTH_CLIENT_ID, isDev, walletConnectProjectId } from "./constants";
import googleIcon from "./../assets/images/google-logo.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
import { providers } from "ethers";
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
import { type PublicClient, usePublicClient } from "wagmi";
import { type HttpTransport } from "viem";

export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";
// export const ARBITRUM_MAINNET = "https://rpc.ankr.com/arbitrum";

const clientId = WEB3AUTH_CLIENT_ID as string;
// arbitrum.rpcUrls.default.http[0] = ARBITRUM_MAINNET;
// arbitrum.rpcUrls.public.http[0] = ARBITRUM_MAINNET;

const providersArray: ChainProviderFn[] = [];

if (INFURA_KEY && !isDev) {
    providersArray.push(
        infuraProvider({
            apiKey: INFURA_KEY as string,
        })
    );
}
providersArray.push(publicProvider());

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    [
        arbitrum,
        mainnet,
        polygon,

        // optimism, avalanche, gnosis, fantom, bsc
    ],
    // @ts-ignore
    providersArray,
    {
        batch: {
            multicall: {
                batchSize: 2048,
                wait: 500,
            },
        },
        pollingInterval: 30000,
    }
);

// Instantiating Web3Auth
const web3AuthInstance = new Web3AuthNoModal({
    clientId,
    web3AuthNetwork: "cyan",
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x" + arbitrum.id.toString(16),
        rpcTarget: ARBITRUM_MAINNET,
        displayName: arbitrum.name,
        tickerName: arbitrum.nativeCurrency.name,
        ticker: arbitrum.nativeCurrency.symbol,
        blockExplorer: "https://arbiscan.io/",
    },
});

const PrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: {
        chainConfig: {
            chainId: "0x" + arbitrum.id.toString(16),
            rpcTarget: ARBITRUM_MAINNET,
            displayName: arbitrum.name,
            tickerName: arbitrum.nativeCurrency.name,
            ticker: arbitrum.nativeCurrency.symbol,
            blockExplorer: "https://arbiscan.io/",
        },
    },
});

export async function getWeb3AuthProvider(config: {
    chainId: number;
    rpc: string;
    name: string;
    tickerName: string;
    ticker: string;
    blockExplorer: string;
    pkey: string;
}) {
    const PrivateKeyProvider = new EthereumPrivateKeyProvider({
        config: {
            chainConfig: {
                chainId: "0x" + config.chainId.toString(16),
                rpcTarget: config.rpc,
                displayName: config.name,
                tickerName: config.tickerName,
                ticker: config.ticker,
                blockExplorer: config.blockExplorer,
            },
        },
    });
    await PrivateKeyProvider.setupProvider(config.pkey);
    return new providers.Web3Provider(PrivateKeyProvider.provider!);
}

const openloginAdapter = new OpenloginAdapter({
    privateKeyProvider: PrivateKeyProvider,
    adapterSettings: {
        network: "cyan",
    },
});

web3AuthInstance.configureAdapter(openloginAdapter);

// const { connectors } = getDefaultWallets({
//     appName: 'Contrax',
//     projectId: walletConnectProjectId,
//     chains
//   });

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
    {
        groupName: "Wallets",
        wallets: [
            injectedWallet({ chains }),
            rainbowWallet({ chains, projectId: walletConnectProjectId }),
            walletConnectWallet({ chains, projectId: walletConnectProjectId }),
            braveWallet({ chains }),
            coinbaseWallet({ chains, appName: "Contrax" }),
            metaMaskWallet({ chains, projectId: walletConnectProjectId }),
            safeWallet({ chains }),
            argentWallet({ chains, projectId: walletConnectProjectId }),
        ],
    },
]);

export const wagmiClient = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});
export const web3authProvider = web3AuthInstance.provider;

export function publicClientToProvider(publicClient: PublicClient) {
    const { chain, transport } = publicClient;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback") {
        const provider = new providers.FallbackProvider(
            (transport.transports as ReturnType<HttpTransport>[]).map(
                ({ value }) => new providers.JsonRpcProvider(value?.url, network)
            )
        );
        provider.pollingInterval = 30000;
        return provider;
    }
    const provider = new providers.JsonRpcProvider(transport.url, network);
    provider.pollingInterval = 30000;
    return provider;
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
    const publicClient = usePublicClient({ chainId });
    return useMemo(() => publicClientToProvider(publicClient), [publicClient]);
}

export function walletClientToSigner(walletClient: WalletClient) {
    const { account, chain, transport } = walletClient;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new providers.Web3Provider(transport, network);
    provider.pollingInterval = 30000;
    const signer = provider.getSigner(account.address);
    return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
    const { data: walletClient } = useWalletClient({ chainId });
    return useMemo(() => (walletClient ? walletClientToSigner(walletClient) : undefined), [walletClient]);
}
