import React, { useEffect, useMemo, useState } from "react";
import * as ethers from "ethers";
import { defaultChainId, web3AuthConnectorId } from "src/config/constants";
import { useQuery } from "@tanstack/react-query";
import { GET_PRICE_TOKEN } from "src/config/constants/query";
import {
    usePublicClient,
    useWalletClient,
    useAccount,
    useDisconnect,
    useNetwork,
    useSwitchNetwork,
    Chain,
    useBalance,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getConnectorId, getNetworkName, resolveDomainFromAddress, toEth } from "src/utils/common";
import { getMulticallProvider } from "src/config/multicall";
import { providers } from "@0xsequence/multicall/";
import useBalances from "src/hooks/useBalances";
import { useDispatch } from "react-redux";
import { setConnectorId } from "src/state/settings/settingsReducer";
import { GasSponsoredSigner } from "src/utils/gasSponsoredSigner";
import { useAppSelector } from "src/state";
import { getWeb3AuthProvider } from "src/config/walletConfig";
import { incrementErrorCount, resetErrorCount } from "src/state/error/errorReducer";
import { CHAIN_ID } from "src/types/enums";
import { useEthersProvider, useEthersSigner } from "src/config/walletConfig";
import { getTokenPricesBackend } from "src/api/token";

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
    domainName: null | string;
    mainnetMulticallProvider: providers.MulticallProvider;
    polygonMulticallProvider: providers.MulticallProvider;
}

type BalanceResult = {
    price: number;
    usdAmount: number;
    decimals?: number | undefined;
    formatted?: string | undefined;
    // symbol?: string | undefined;
    value?: ethers.ethers.BigNumber | undefined;
};

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
    children: React.ReactNode;
}

const useWaleltSigner = () => {
    const _signer = useEthersSigner();
    const [signer, setSigner] = useState<ethers.ethers.providers.JsonRpcSigner | ethers.ethers.Signer>();
    const { connectorId } = useAppSelector((state) => state.settings);

    useEffect(() => {
        const setupSigner = async () => {
            if (web3AuthConnectorId === connectorId) {
                // @ts-ignore
                const privateKey = await _signer?.provider?.provider?.request({ method: "eth_private_key" });
                if (privateKey) setSigner(new GasSponsoredSigner(privateKey, _signer?.provider));
            } else {
                // @ts-ignore
                setSigner(_signer);
            }
        };

        setupSigner();
    }, [_signer, web3AuthConnectorId, connectorId]);
    return signer;
};

const useNativeBalance = (chainId: number): BalanceResult => {
    const { data: price } = useQuery({
        queryKey: GET_PRICE_TOKEN(getNetworkName(chainId), ethers.constants.AddressZero),
        queryFn: () => getTokenPricesBackend(),
        select(data) {
            if (data) {
                return data[String(chainId)][ethers.constants.AddressZero];
            }
        },
        refetchInterval: 60000,
    });
    const { balances, mainnetBalances, polygonBalances } = useBalances();

    const balance = useMemo(() => {
        switch (chainId) {
            case CHAIN_ID.ARBITRUM:
                return balances[ethers.constants.AddressZero];
            case CHAIN_ID.MAINNET:
                return mainnetBalances[ethers.constants.AddressZero];
            case CHAIN_ID.POLYGON:
                return polygonBalances[ethers.constants.AddressZero];

            default:
                return "0";
        }
    }, [chainId, balances, mainnetBalances, polygonBalances]);

    const formatted = useMemo(() => toEth(balance || 0), [balance]);
    const usdAmount = useMemo(() => (price || 0) * Number(formatted), [price, formatted]);

    return {
        price: price || 0,
        decimals: 18,
        formatted,
        value: ethers.BigNumber.from(balance || 0),
        usdAmount,
    };
};

const useMulticallProvider = (chainId?: number) => {
    const provider = useEthersProvider({ chainId });
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
    useEffect(() => {
        setMulticallProvider(getMulticallProvider(provider));
    }, [provider, chainId]);
    return multicallProvider;
};

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const provider = useEthersProvider();
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
    const mainnetMulticallProvider = useMulticallProvider(CHAIN_ID.MAINNET);
    const polygonMulticallProvider = useMulticallProvider(CHAIN_ID.POLYGON);
    const { balances } = useBalances();
    const signer = useWaleltSigner();

    const { switchNetworkAsync, chains } = useSwitchNetwork();
    const dispatch = useDispatch();
    const { address: currentWallet, connector, isConnecting } = useAccount();
    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();
    const [networkId, setNetworkId] = React.useState<number>(defaultChainId);
    const { openConnectModal } = useConnectModal();
    const polygonBalance = useNativeBalance(CHAIN_ID.POLYGON);
    const mainnetBalance = useNativeBalance(CHAIN_ID.MAINNET);
    const arbitrumBalance = useNativeBalance(CHAIN_ID.ARBITRUM);
    const [domainName, setDomainName] = useState<null | string>(null);
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

    const getWeb3AuthSigner = React.useCallback(
        async (chainId?: number, defaultSigner?: ethers.Signer) => {
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
        },
        [signer, getConnectorId()]
    );

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

    React.useEffect(() => {
        if (isConnecting) {
            const ele = document.querySelector("[data-rk] ._1am14410");
            // @ts-ignore
            if (ele) ele.style.filter = "saturate(0) blur(1px)";
        } else {
            const ele = document.querySelector("[data-rk] ._1am14410");
            // @ts-ignore
            if (ele) ele.style.filter = "";
        }
    }, [isConnecting]);

    React.useEffect(() => {
        if (currentWallet) {
            resolveDomainFromAddress(currentWallet).then((res) => {
                setDomainName(res);
            });
        } else {
            setDomainName(null);
        }
    }, [currentWallet]);

    return (
        <WalletContext.Provider
            value={{
                currentWallet: currentWallet || "",
                // currentWallet: "0x1C9057544409046f82d7d47332383a6780763EAF",
                // currentWallet: "0x6403e9d6141fb36B76521871e986d68FebBda064",
                // currentWallet: "0x74541e279fe87135e43D390aA5eaB8486fb185B9",
                // currentWallet: "0x240AEDcD6A9fD9f3CA1fE0ED2e122dA87f5836f1",
                // currentWallet: "0x71dde932c6fdfd6a2b2e9d2f4f1a2729a3d05981",
                // currentWallet: "0xa5c863ee37aa829FD07634826e4F45bc601D8Dea",
                // currentWallet: "0x59da55D936A86C203C17bC8037EE745008843694",
                // currentWallet: "0xa5c863ee37aa829FD07634826e4F45bc601D8Dea",
                // currentWallet: "0x9da847cD29d0da97fBFAEe0692d336857CF00cd3",
                // currentWallet: "0x59da55D936A86C203C17bC8037EE745008843694",

                connectWallet,
                networkId,
                logout,
                domainName,
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
                mainnetMulticallProvider,
                polygonMulticallProvider,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
