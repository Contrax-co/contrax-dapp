import React, { useMemo, useState } from "react";
import * as ethers from "ethers";
import { defaultChainId } from "src/config/constants";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_BALANCE } from "src/config/constants/query";
import { useProvider, useSigner, useAccount, useDisconnect, useNetwork, useSwitchNetwork, Chain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { notifyError } from "src/api/notify";
import { getNetworkName, noExponents } from "src/utils/common";
import { getMulticallProvider } from "src/config/multicall";
import { providers } from "@0xsequence/multicall/";
import useBalances from "src/hooks/useBalances";
import { errorMessages } from "src/config/constants/notifyMessages";

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
    /**
     * Refetches the balance of the user
     */
    refetchBalance: () => void;
    switchNetworkAsync: ((chainId_?: number | undefined) => Promise<Chain>) | undefined;
    chains: Chain[];
    getPkey: () => Promise<string>;
    mainnetBalance: ethers.BigNumber;
    multicallProvider: providers.MulticallProvider;
}

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
    children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const provider = useProvider();
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
    const { balances } = useBalances();

    const { switchNetworkAsync, chains } = useSwitchNetwork();
    const { data: signer } = useSigner();

    const { address: currentWallet } = useAccount();
    const { disconnect } = useDisconnect();
    const mainnetProvider = useProvider({ chainId: 1 });
    const { chain } = useNetwork();
    const [networkId, setNetworkId] = React.useState<number>(defaultChainId);
    const { openConnectModal } = useConnectModal();

    const getBalance = async () => {
        if (!provider || !currentWallet)
            return { balance: ethers.BigNumber.from(0), mainnetBalance: ethers.BigNumber.from(0) };
        const mainnetBalance = await mainnetProvider.getBalance(currentWallet);
        return {
            balance: ethers.BigNumber.from(noExponents(balances[ethers.constants.AddressZero] || "")),
            mainnetBalance,
        };
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

    const {
        data: { balance: balanceBigNumber, mainnetBalance },
        refetch: refetchBalance,
    } = useQuery(ACCOUNT_BALANCE(currentWallet!, currentWallet!, networkId.toString()), getBalance, {
        enabled: !!currentWallet && !!provider && !!getNetworkName(networkId),
        initialData: { balance: ethers.BigNumber.from(0), mainnetBalance: ethers.BigNumber.from(0) },
        refetchInterval: 5000,
    });
    const balance = useMemo(() => Number(ethers.utils.formatUnits(balanceBigNumber || 0, 18)), [balanceBigNumber]);

    const getPkey = async () => {
        try {
            // @ts-ignore
            const pkey = await signer?.provider?.provider?.request({ method: "eth_private_key" });
            return pkey;
        } catch (error) {
            console.log(error);
            notifyError(errorMessages.privateKeyError());
        }
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

    return (
        <WalletContext.Provider
            value={{
                currentWallet: currentWallet || "",
                // currentWallet: "0x1C9057544409046f82d7d47332383a6780763EAF",
                connectWallet,
                networkId,
                logout,
                displayAccount,
                // @ts-ignore
                signer,
                provider,
                balance,
                refetchBalance,
                switchNetworkAsync,
                chains,
                mainnetBalance,
                getPkey,
                multicallProvider,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
