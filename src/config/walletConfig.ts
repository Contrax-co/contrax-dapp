import { arbitrum, mainnet, avalanche, bsc, optimism, polygon, gnosis, fantom } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { createClient, configureChains } from "wagmi";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { INFURA_KEY, WEB3AUTH_CLIENT_ID, isDev } from "./constants";
import googleIcon from "./../assets/images/google-logo.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
import { providers } from "ethers";

export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";
// export const ARBITRUM_MAINNET = "https://rpc.ankr.com/arbitrum";

const clientId = WEB3AUTH_CLIENT_ID as string;
arbitrum.rpcUrls.default.http[0] = ARBITRUM_MAINNET;
arbitrum.rpcUrls.public.http[0] = ARBITRUM_MAINNET;

const providersArray = [];

if (INFURA_KEY && !isDev) {
    providersArray.push(
        infuraProvider({
            apiKey: INFURA_KEY as string,
        })
    );
}
providersArray.push(publicProvider());

export const { chains, provider, webSocketProvider } = configureChains(
    [
        arbitrum,
        mainnet,
        polygon,

        // optimism, avalanche, gnosis, fantom, bsc
    ],
    providersArray
);

// Instantiating Web3Auth
const web3AuthInstance = new Web3AuthNoModal({
    clientId,
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
    provider,
    // webSocketProvider,
});
export const web3authProvider = web3AuthInstance.provider;
