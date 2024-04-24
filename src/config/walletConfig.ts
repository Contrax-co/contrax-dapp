import { useMemo } from "react";
import { arbitrum, mainnet, polygon } from "viem/chains";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
    ALCHEMY_KEY,
    INFURA_KEY,
    POLLING_INTERVAL,
    WEB3AUTH_CLIENT_ID,
    isDev,
    walletConnectProjectId,
} from "./constants";
import { Web3Auth } from "@web3auth/modal";
import googleIcon from "./../assets/images/google-logo.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
import twitterIcon from "./../assets/images/twitter-icon.svg";
import { providers } from "ethers";
import { PublicClient, WalletClient, http, type HttpTransport } from "viem";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { WalletConnectModal } from "@walletconnect/modal";
import { getWalletConnectV2Settings, WalletConnectV2Adapter } from "@web3auth/wallet-connect-v2-adapter";

export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";
// export const ARBITRUM_MAINNET = "https://rpc.ankr.com/arbitrum";

const clientId = WEB3AUTH_CLIENT_ID as string;
// arbitrum.rpcUrls.default.http[0] = ARBITRUM_MAINNET;
// arbitrum.rpcUrls.public.http[0] = ARBITRUM_MAINNET;

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
export const web3AuthInstance = new Web3Auth({
    clientId,
    web3AuthNetwork: "cyan",
    privateKeyProvider: PrivateKeyProvider,
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
const metamaskAdapter = new MetamaskAdapter({
    clientId,
    sessionTime: 3600, // 1 hour in seconds
    web3AuthNetwork: "cyan",
});
const defaultWcSettings = {
    adapterSettings: {
        walletConnectInitOptions: {
            projectId: "bb20b40a5d133af4db2d40117f6184a7",
            relayUrl: "wss://relay.walletconnect.com",
            metadata: {
                name: "Contrax",
                description: "Contrax",
                url: "http://localhost:3000",
                icons: ["http://localhost:3000/favicon.ico"],
            },
        },
    },
    loginSettings: {
        optionalNamespaces: {
            eip155: {
                methods: ["eth_sendTransaction", "eth_sign", "personal_sign", "eth_signTypedData"],
                chains: ["eip155:270689"],
                events: ["chainChanged", "accountsChanged"],
            },
        },
    },
};

// const walletConnectModal = new WalletConnectModal({ projectId: walletConnectProjectId });
// const walletConnectV2Adapter = new WalletConnectV2Adapter({
//     clientId,
//     web3AuthNetwork: "cyan",
//     adapterSettings: {
//         qrcodeModal: walletConnectModal,
//         ...defaultWcSettings.adapterSettings,
//     },
//     loginSettings: { ...defaultWcSettings.loginSettings },
// });
// web3AuthInstance.configureAdapter(walletConnectV2Adapter);
web3AuthInstance.configureAdapter(openloginAdapter);
web3AuthInstance.configureAdapter(metamaskAdapter);

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

// export const wagmiClient = createConfig({
//     connectors: [
//         injected(),
//         safe(),
//         walletConnect({ projectId: walletConnectProjectId }),
//         Web3AuthConnector({
//             web3AuthInstance,
//             loginParams: {
//                 loginProvider: "google",
//             },
//         }),
//     ],
//     chains: [arbitrum, mainnet, polygon],
//     transports: {
//         [arbitrum.id]: http(ALCHEMY_KEY ? `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : undefined),
//         [mainnet.id]: http(),
//         [polygon.id]: http(),
//     },
//     batch: {
//         multicall: {
//             batchSize: 2048,
//             wait: 500,
//         },
//     },
// });
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
