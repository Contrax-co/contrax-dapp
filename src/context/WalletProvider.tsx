import React, { useMemo } from "react";
import * as ethers from "ethers";
import { defaultChainId } from "src/config/constants";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_BALANCE } from "src/config/constants/query";
import useConstants from "src/hooks/useConstants";
import { ARBITRUM_MAINNET } from "src/config/walletConfig";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import {
    createClient,
    WagmiConfig,
    configureChains,
    useProvider,
    useSigner,
    useAccount,
    useConnect,
    useDisconnect,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

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
    provider?:
        | ethers.ethers.providers.Web3Provider
        | ethers.ethers.providers.JsonRpcProvider
        | ethers.ethers.providers.Provider;

    /**
     * Balance of the native eth that the user has
     */
    balance: number;

    /**
     * Balance of the native eth that the user has in bignumber
     */
    balanceBigNumber: ethers.BigNumber;

    /**
     * Refetches the balance of the user
     */
    refetchBalance: () => void;
}

export const WalletContext = React.createContext<IWalletContext>({
    currentWallet: "",
    displayAccount: "",
    connectWallet: () => Promise<any>,
    networkId: defaultChainId,
    logout: () => {},
    signer: undefined,
    provider: undefined,
    balance: 0,
    balanceBigNumber: ethers.BigNumber.from(0),
    refetchBalance: () => {},
});

interface IProps {
    children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const provider = useProvider();

    const { data: signer } = useSigner();

    const { address: currentWallet } = useAccount();
    const { disconnect } = useDisconnect();
    const { connectors } = useConnect();
    const [networkId, setNetworkId] = React.useState<number>(defaultChainId);
    const { NETWORK_NAME } = useConstants();
    const { openConnectModal } = useConnectModal();

    const getBalance = async () => {
        if (!provider || !currentWallet) return ethers.BigNumber.from(0);
        const balance = await provider.getBalance(currentWallet);
        return balance;
    };

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

    const { data: balanceBigNumber, refetch: refetchBalance } = useQuery(
        ACCOUNT_BALANCE(currentWallet!, currentWallet!, NETWORK_NAME),
        getBalance,
        {
            enabled: !!currentWallet && !!provider && !!NETWORK_NAME,
            initialData: ethers.BigNumber.from(0),
            refetchInterval: 5000,
        }
    );

    const balance = useMemo(() => Number(ethers.utils.formatUnits(balanceBigNumber || 0, 18)), [balanceBigNumber]);
    return (
        <WalletContext.Provider
            value={{
                currentWallet: currentWallet || "",
                connectWallet,
                networkId,
                logout,
                displayAccount,
                // @ts-ignore
                signer,
                provider,
                balance,
                balanceBigNumber,
                refetchBalance,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
