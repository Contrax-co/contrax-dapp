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
import { getConnectorId, getNetworkName, toEth } from "src/utils/common";
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
import SocialLogin from "@biconomy/web3-auth";
import "@biconomy/web3-auth/dist/src/style.css";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { BiconomySigner } from "src/utils/biconomySigner";
import { useWeb3AuthContext } from "./SocialLoginContext";
import { useSmartAccountContext } from "./SmartAccountContext";

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
    polygonBalance?: BalanceResult;
    mainnetBalance?: BalanceResult;
    arbitrumBalance?: BalanceResult;
    connectBiconomy: () => void;
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

const useNativeBalance = (chainId: number): BalanceResult => {
    const { data: price } = useQuery({
        queryKey: GET_PRICE_TOKEN(getNetworkName(chainId), ethers.constants.AddressZero),
        queryFn: () => getPrice(ethers.constants.AddressZero, chainId),
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
    const provider = useProvider({ chainId });
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
    useEffect(() => {
        setMulticallProvider(getMulticallProvider(provider));
    }, [provider, chainId]);
    return multicallProvider;
};

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const provider = useProvider();
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
    const mainnetMulticallProvider = useMulticallProvider(CHAIN_ID.MAINNET);
    const polygonMulticallProvider = useMulticallProvider(CHAIN_ID.POLYGON);
    const { balances } = useBalances();
    const { data: _signer } = useSigner();
    const [signer, setSigner] = useState<any>();

    const { switchNetworkAsync, chains } = useSwitchNetwork();
    const dispatch = useDispatch();
    const { address: currentWalletWagmi, connector } = useAccount();
    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();
    const [networkId, setNetworkId] = React.useState<number>(defaultChainId);
    // @ts-ignore
    const [currentWallet, setCurrentWallet] = useState<`0x${string}`>("");
    const polygonBalance = useNativeBalance(CHAIN_ID.POLYGON);
    const mainnetBalance = useNativeBalance(CHAIN_ID.MAINNET);
    const arbitrumBalance = useNativeBalance(CHAIN_ID.ARBITRUM);
    const { openConnectModal } = useConnectModal();
    const {
        loading: eoaLoading,
        userInfo,
        connect,
        web3Provider: _biconomyProvider,
        disconnect: _biconomyDisconnect,
        getUserInfo,
    } = useWeb3AuthContext();
    const { selectedAccount, loading: scwLoading, setSelectedAccount, state } = useSmartAccountContext();
    console.log(selectedAccount, state);
    const connectWallet = async () => {
        openConnectModal && openConnectModal();
        return false;
    };

    const connectBiconomy = () => {
        connect();
    };

    async function logout() {
        disconnect();
        if (_biconomyProvider) {
            _biconomyDisconnect();
        }
    }

    useEffect(() => {
        if (_biconomyProvider) {
            new BiconomySigner(_biconomyProvider);
        } else {
            setSigner(_signer);
        }
    }, [_signer, _biconomyProvider]);

    useEffect(() => {
        if (currentWalletWagmi) {
            setCurrentWallet(currentWalletWagmi);
        } else if (selectedAccount?.smartAccountAddress) {
            // @ts-ignore
            setCurrentWallet(selectedAccount.smartAccountAddress);
        } else {
            // @ts-ignore
            setCurrentWallet("");
        }
    }, [currentWalletWagmi, selectedAccount]);

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
        return "";
        // try {
        //     // @ts-ignore
        //     const pkey = await signer?.provider?.provider?.request({ method: "eth_private_key" });
        //     return pkey;
        // } catch (error) {
        //     console.warn("Pkey: Not web3auth signer!");
        //     // notifyError(errorMessages.privateKeyError());
        // }
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
                polygonBalance,
                mainnetBalance,
                arbitrumBalance,
                connectBiconomy,
                mainnetMulticallProvider,
                polygonMulticallProvider,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
