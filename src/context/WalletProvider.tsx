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

const useNativeBalance = (currentWallet: `0x${string}` | undefined, chainId: number): BalanceResult => {
    const { data: price } = useQuery({
        queryKey: GET_PRICE_TOKEN(getNetworkName(chainId), ethers.constants.AddressZero),
        queryFn: () => getPrice(ethers.constants.AddressZero, chainId),
        refetchInterval: 60000,
    });

    const { data: bal } = useBalance({
        address: currentWallet,
        chainId: chainId,
        watch: true,
    });

    return {
        ...bal,
        price: price || 0,
        usdAmount: (price || 0) * Number(bal?.formatted),
    };
};

// let options = {
//     activeNetworkId: ChainId.ARBITRUM_ONE_MAINNET,
//     supportedNetworksIds: [ChainId.ARBITRUM_ONE_MAINNET, ChainId.POLYGON_MUMBAI],
//     networkConfig: [
//         {
//             chainId: ChainId.ARBITRUM_ONE_MAINNET,
//             // Dapp API Key you will get from new Biconomy dashboard that will be live soon
//             // Meanwhile you can use the test dapp api key mentioned above
//             dappAPIKey: "LNyR-YF15.5528fd61-d34c-4a35-bb92-69510d521b1f",
//             providerUrl: "https://arbitrum-mainnet.infura.io/v3/547b7378b8c2400aafd92ef4281c732f",
//         },
//         {
//             chainId: ChainId.POLYGON_MAINNET,
//             // Dapp API Key you will get from new Biconomy dashboard that will be live soon
//             // Meanwhile you can use the test dapp api key mentioned above
//             dappAPIKey: "LNyR-YF15.5528fd61-d34c-4a35-bb92-69510d521b1f",
//             providerUrl: "https://polygon-mainnet.infura.io/v3/547b7378b8c2400aafd92ef4281c732f",
//         },
//     ],
// };

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const provider = useProvider();
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
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
    const polygonBalance = useNativeBalance(currentWallet, CHAIN_ID.POLYGON);
    const mainnetBalance = useNativeBalance(currentWallet, CHAIN_ID.MAINNET);
    const arbitrumBalance = useNativeBalance(currentWallet, CHAIN_ID.ARBITRUM);
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
    console.log(selectedAccount,state)
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
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
