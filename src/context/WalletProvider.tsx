import React, { useEffect, useMemo, useState } from "react";
import * as ethers from "ethers";
import { defaultChainId, web3AuthConnectorId } from "src/config/constants";
import { useQuery } from "@tanstack/react-query";
import { GET_PRICE_TOKEN } from "src/config/constants/query";
import {
    useProvider,
    useSigner,
    useAccount,
    useDisconnect,
    useNetwork,
    useSwitchNetwork,
    Chain,
    useBalance,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getConnectorId, getNetworkName } from "src/utils/common";
import { getMulticallProvider } from "src/config/multicall";
import { providers } from "@0xsequence/multicall/";
import useBalances from "src/hooks/useBalances";
import { useDispatch } from "react-redux";
import { setConnectorId } from "src/state/settings/settingsReducer";
import { GasSponsoredSigner } from "src/utils/gasSponsoredSigner";
import { useAppSelector } from "src/state";
import { getWeb3AuthProvider } from "src/config/walletConfig";
import { incrementErrorCount, resetErrorCount } from "src/state/error/errorReducer";
import { getPrice } from "src/api/token";
import { CHAIN_ID } from "src/types/enums";

interface IWalletContext {
    /**
     * The current connect wallet address
     */
    currentWallet: string;

    /**
     * The current connected wallet address truncated
     */
    displayAccount: string;

    /**
     * Connect wallet modal open for connecting any wallet
     * @returns void
     */
    connectWallet: () => void;

    /**
     * The current chain id in number form e.g 5
     */
    networkId: number;

    /**
     * Disconnect wallet and logout user
     * @returns void
     */
    logout: () => void;
    signer?: ethers.ethers.providers.JsonRpcSigner | ethers.ethers.Signer;
    provider:
        | ethers.ethers.providers.Web3Provider
        | ethers.ethers.providers.JsonRpcProvider
        | ethers.ethers.providers.Provider;

    /**
     * Balance of the native eth that the user has
     */
    balance: number;
    switchNetworkAsync: ((chainId_?: number | undefined) => Promise<Chain>) | undefined;
    chains: Chain[];
    getPkey: () => Promise<string>;
    multicallProvider: providers.MulticallProvider;
    getWeb3AuthSigner: (chainId?: number, defaultSigner?: ethers.Signer) => Promise<ethers.ethers.Signer | undefined>;
    isWeb3AuthWallet: boolean;
    polygonBalance?: BalanceResult;
    mainnetBalance?: BalanceResult;
    arbitrumBalance?: BalanceResult;
}

type BalanceResult = {
    price: number;
    usdAmount: number;
    decimals?: number | undefined;
    formatted?: string | undefined;
    symbol?: string | undefined;
    value?: ethers.ethers.BigNumber | undefined;
};

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
    children: React.ReactNode;
}

const useWaleltSigner = () => {
    const { data: _signer } = useSigner();
    const [signer, setSigner] = useState<ethers.ethers.providers.JsonRpcSigner | ethers.ethers.Signer>();
    const { connectorId, sponsoredGas } = useAppSelector((state) => state.settings);

    useEffect(() => {
        const setupSigner = async () => {
            if (web3AuthConnectorId === connectorId && sponsoredGas) {
                // @ts-ignore
                const privateKey = await _signer?.provider?.provider?.request({ method: "eth_private_key" });
                if (privateKey) setSigner(new GasSponsoredSigner(privateKey, _signer?.provider));
            } else {
                // @ts-ignore
                setSigner(_signer);
            }
        };

        setupSigner();
    }, [_signer, sponsoredGas, web3AuthConnectorId, connectorId]);
    return signer;
};

const useNativeBalance = (currentWallet: `0x${string}` | undefined, chainId: number): BalanceResult => {
    const { data: price } = useQuery({
        queryKey: GET_PRICE_TOKEN(getNetworkName(chainId), ethers.constants.AddressZero),
        queryFn: () => getPrice(ethers.constants.AddressZero, chainId),
        refetchInterval: 60000,
    });

    const { data: bal, refetch } = useBalance({
        address: currentWallet,
        chainId: chainId,
        enabled: !!currentWallet,
    });

    useEffect(() => {
        const int = setInterval(() => {
            if (currentWallet) refetch();
        }, 10000);
        return () => {
            clearInterval(int);
        };
    }, [currentWallet]);

    return {
        ...bal,
        price: price || 0,
        usdAmount: (price || 0) * Number(bal?.formatted),
    };
};

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const provider = useProvider();
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
    const { balances } = useBalances();
    const signer = useWaleltSigner();

    const { switchNetworkAsync, chains } = useSwitchNetwork();
    const dispatch = useDispatch();
    const { address: currentWallet, connector } = useAccount();
    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();
    const [networkId, setNetworkId] = React.useState<number>(defaultChainId);
    const { openConnectModal } = useConnectModal();
    const polygonBalance = useNativeBalance(currentWallet, CHAIN_ID.POLYGON);
    const mainnetBalance = useNativeBalance(currentWallet, CHAIN_ID.MAINNET);
    const arbitrumBalance = useNativeBalance(currentWallet, CHAIN_ID.ARBITRUM);

    const connectWallet = async () => {
        if (openConnectModal) openConnectModal();

        return false;
    };

    async function logout() {
        disconnect();
    }

    const displayAccount = React.useMemo(
        () =>
            currentWallet
                ? `${currentWallet?.substring(0, 6)}...${currentWallet?.substring(currentWallet.length - 5)}`
                : "",
        [currentWallet]
    );

    const balance = useMemo(
        () => Number(ethers.utils.formatUnits(balances[ethers.constants.AddressZero] || 0, 18)),
        [balances]
    );

    const getPkey = async () => {
        try {
            // @ts-ignore
            const pkey = await signer?.provider?.provider?.request({ method: "eth_private_key" });
            return pkey;
        } catch (error) {
            console.warn("Pkey: Not web3auth signer!");
            // notifyError(errorMessages.privateKeyError());
        }
    };

    const getWeb3AuthSigner = async (chainId?: number, defaultSigner?: ethers.Signer) => {
        if (web3AuthConnectorId !== getConnectorId()) return defaultSigner || signer;
        // @ts-ignore
        const pkey = await getPkey();
        const chain = chains.find((c) => c.id === chainId);
        const _provider = await getWeb3AuthProvider({
            chainId: chain?.id!,
            blockExplorer: chain?.blockExplorers?.default.url!,
            name: chain?.name!,
            rpc: chain?.rpcUrls.default.http[0]!,
            ticker: chain?.nativeCurrency.symbol!,
            tickerName: chain?.nativeCurrency.name!,
            pkey,
        });

        const privateKey = await _provider.provider.request!({ method: "eth_private_key" });
        if (!privateKey) {
            console.log("%cPrivate key not found", "color: magenta;");
            return defaultSigner || signer;
        }
        return new GasSponsoredSigner(privateKey, _provider);
    };

    React.useEffect(() => {
        if (chain) {
            setNetworkId(chain.id);
        }
        if (!currentWallet) {
            setNetworkId(defaultChainId);
        }
    }, [chain]);

    React.useEffect(() => {
        setMulticallProvider(getMulticallProvider(provider));
    }, [provider]);

    React.useEffect(() => {
        dispatch(setConnectorId(connector?.id || ""));
    }, [connector]);

    React.useEffect(() => {
        const int = setInterval(async () => {
            try {
                if ((await getPrice(ethers.constants.AddressZero, defaultChainId)) === 0) {
                    throw new Error();
                }
                await provider.getBlockNumber();
                dispatch(resetErrorCount());
            } catch (error) {
                dispatch(incrementErrorCount());
                console.log("Error in rpc");
            }
        }, 5000);
        return () => {
            clearInterval(int);
        };
    }, [provider]);

    return (
        <WalletContext.Provider
            value={{
                currentWallet: currentWallet || "",
                // currentWallet: "0x1C9057544409046f82d7d47332383a6780763EAF",
                connectWallet,
                networkId,
                logout,
                displayAccount,
                signer,
                provider,
                balance,
                switchNetworkAsync,
                chains,
                getPkey,
                multicallProvider,
                getWeb3AuthSigner,
                isWeb3AuthWallet: web3AuthConnectorId === getConnectorId(),
                polygonBalance,
                mainnetBalance,
                arbitrumBalance,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
