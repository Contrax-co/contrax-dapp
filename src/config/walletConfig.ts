import { useMemo } from "react";
import { arbitrum, mainnet, polygon, optimism, linea, bsc } from "viem/chains";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { POLLING_INTERVAL, WEB3AUTH_CLIENT_ID } from "./constants";
import { Web3Auth } from "@web3auth/modal";
import { providers } from "ethers";
import { PublicClient, WalletClient, http, type HttpTransport } from "viem";
export const ARBITRUM_MAINNET = "https://arb1.arbitrum.io/rpc";
// export const ARBITRUM_MAINNET = "https://rpc.ankr.com/arbitrum";
const clientId = WEB3AUTH_CLIENT_ID as string;
// arbitrum.rpcUrls.default.http[0] = ARBITRUM_MAINNET;
// arbitrum.rpcUrls.public.http[0] = ARBITRUM_MAINNET;

export const SupportedChains = [arbitrum, mainnet, polygon, optimism, linea, bsc];

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
