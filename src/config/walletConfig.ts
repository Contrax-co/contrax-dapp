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
import { WalletConnectV2Adapter } from "@web3auth/wallet-connect-v2-adapter";
import { ENTRYPOINT_ADDRESS_V07, createBundlerClient } from "permissionless";
import { bundlersByChainId } from "./constants/urls";
import { CHAIN_ID } from "src/types/enums";
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

export const bundlerClient = createBundlerClient({
    chain: arbitrum,
    transport: http(bundlersByChainId[CHAIN_ID.ARBITRUM]),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
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
        chainId: chain?.id,
        name: chain?.name,
        ensAddress: chain?.contracts?.ensRegistry?.address,
    };
    // @ts-ignore
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
