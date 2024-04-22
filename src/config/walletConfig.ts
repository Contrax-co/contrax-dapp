import { useMemo } from "react";
import { arbitrum, mainnet, polygon } from "wagmi/chains";
import { injected, safe, walletConnect } from "wagmi/connectors";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { createConfig, useWalletClient } from "wagmi";
import {
    ALCHEMY_KEY,
    INFURA_KEY,
    POLLING_INTERVAL,
    WEB3AUTH_CLIENT_ID,
    isDev,
    walletConnectProjectId,
} from "./constants";
import googleIcon from "./../assets/images/google-logo.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
import twitterIcon from "./../assets/images/twitter-icon.svg";
import { providers } from "ethers";
import { PublicClient, WalletClient, http, type HttpTransport } from "viem";

export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";
// export const ARBITRUM_MAINNET = "https://rpc.ankr.com/arbitrum";

const clientId = WEB3AUTH_CLIENT_ID as string;
// arbitrum.rpcUrls.default.http[0] = ARBITRUM_MAINNET;
// arbitrum.rpcUrls.public.http[0] = ARBITRUM_MAINNET;

// Instantiating Web3Auth
const web3AuthInstance = new Web3AuthNoModal({
    clientId,
    web3AuthNetwork: "cyan",
    // sessionTime: 604800, // 7 days
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x" + arbitrum.id.toString(16),
        rpcTarget: ARBITRUM_MAINNET,
        displayName: arbitrum.name,
        tickerName: arbitrum.nativeCurrency.name,
        ticker: arbitrum.nativeCurrency.symbol,
        blockExplorerUrl: "https://arbiscan.io/",
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
            blockExplorerUrl: "https://arbiscan.io/",
            chainNamespace: CHAIN_NAMESPACES.EIP155,
        },
    },
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
function getWeb3authConnector() {
    return (walletDetails: any) => {
        const connector = Web3AuthConnector({
            web3AuthInstance,
            loginParams: {
                loginProvider: "google",
            },
        });
        return (config: any) => ({ ...connector(config) });
    };
}

// const connectors = connectorsForWallets([
//     {
//         groupName: "Social",
//         wallets: [
//             () => ({
//                 ...{
//                     id: "google",
//                     name: "Google",
//                     iconUrl: googleIcon,
//                     iconBackground: "white",
//                     createConnector: getWeb3authConnector(),
//                 },
//             }),

//             // () => ({
//             //     id: "facebook",
//             //     name: "Facebook",
//             //     iconUrl: facebookIcon,
//             //     iconBackground: "white",
//             //     createConnector(walletDetails) {
//             //         const connector = Web3AuthConnector({
//             //             web3AuthInstance,
//             //             loginParams: {
//             //                 loginProvider: "facebook",
//             //             },
//             //         });
//             //         return connector;
//             //     },
//             // }),
//             // () => ({
//             //     id: "discord",
//             //     name: "Discord",
//             //     iconUrl: discordIcon,
//             //     iconBackground: "white",
//             //     createConnector(walletDetails) {
//             //         const connector = Web3AuthConnector({
//             //             web3AuthInstance,
//             //             loginParams: {
//             //                 loginProvider: "discord",
//             //             },
//             //         });
//             //         return connector;
//             //     },
//             // }),
//             // () => ({
//             //     id: "twitter",
//             //     name: "Twitter",
//             //     iconUrl: twitterIcon,
//             //     iconBackground: "white",
//             //     createConnector(walletDetails) {
//             //         const connector = Web3AuthConnector({
//             //             web3AuthInstance,
//             //             loginParams: {
//             //                 loginProvider: "twitter",
//             //             },
//             //         });
//             //         return connector;
//             //     },
//             // }),
//             // () => ({
//             //     id: "github",
//             //     name: "Github",
//             //     iconUrl: githubIcon,
//             //     iconBackground: "white",
//             //     createConnector(walletDetails) {
//             //         const connector = Web3AuthConnector({
//             //             web3AuthInstance,
//             //             loginParams: {
//             //                 loginProvider: "github",
//             //             },
//             //         });
//             //         return connector;
//             //     },
//             // }),
//         ],
//     },
//     {
//         groupName: "Wallets",
//         wallets: [
//             injectedWallet,
//             rainbowWallet,
//             walletConnectWallet,
//             braveWallet,
//             coinbaseWallet,
//             metaMaskWallet,
//             safeWallet,
//             argentWallet,
//         ],
//     },
// ]);

export const wagmiClient = createConfig({
    connectors: [
        injected(),
        safe(),
        walletConnect({ projectId: walletConnectProjectId }),
        Web3AuthConnector({
            web3AuthInstance,
            loginParams: {
                loginProvider: "google",
            },
        }),
    ],
    chains: [arbitrum, mainnet, polygon],
    transports: {
        [arbitrum.id]: http(ALCHEMY_KEY ? `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : undefined),
        [mainnet.id]: http(),
        [polygon.id]: http(),
    },
    batch: {
        multicall: {
            batchSize: 2048,
            wait: 500,
        },
    },
});
export const web3authProvider = web3AuthInstance.provider;

export function publicClientToProvider(publicClient: PublicClient) {
    const { chain, transport } = publicClient;
    const network = {
        chainId: chain?.id ?? arbitrum.id,
        name: chain?.name ?? arbitrum.name,
        ensAddress: chain?.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback") {
        const provider = new providers.FallbackProvider(
            (transport.transports as ReturnType<HttpTransport>[]).map(
                ({ value }) => new providers.JsonRpcProvider(value?.url, network)
            )
        );
        provider.pollingInterval = POLLING_INTERVAL;
        return provider;
    }
    const provider = new providers.JsonRpcProvider(transport.url, network);
    provider.pollingInterval = POLLING_INTERVAL;
    return provider;
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
export function useEthersProvider(publicClient: PublicClient) {
    return useMemo(() => publicClientToProvider(publicClient), [publicClient]);
}

export function walletClientToSigner(walletClient: WalletClient) {
    const { account, chain, transport } = walletClient;
    const network = {
        chainId: chain?.id ?? arbitrum.id,
        name: chain?.name ?? arbitrum.name,
        ensAddress: chain?.contracts?.ensRegistry?.address,
    };
    const provider = new providers.Web3Provider(transport, network);

    const signer = provider.getSigner(account!.address);
    return signer;
}

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

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner(walletClient?: WalletClient) {
    return useMemo(() => (walletClient ? walletClientToSigner(walletClient) : undefined), [walletClient]);
}

/** Hook to convert a viem Wallet Client to an ethers.js Web3Provider. */
export function useEthersWeb3Provider(walletClient?: WalletClient) {
    return useMemo(() => (walletClient ? walletClientToWeb3Provider(walletClient) : undefined), [walletClient]);
}
