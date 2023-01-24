import React, { useMemo } from "react";
import { getUserSession, setUserSession } from "../store/localStorage";
import * as ethers from "ethers";
import { removeUserSession } from "../store/localStorage";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { defaultChainId } from "src/config/constants";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_BALANCE } from "src/config/constants/query";
import useConstants from "src/hooks/useConstants";
import { ARBITRUM_MAINNET } from "src/config/walletConfig";

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
    signer?: ethers.ethers.providers.JsonRpcSigner;
    provider?: ethers.ethers.providers.Web3Provider | ethers.ethers.providers.JsonRpcProvider;

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
    connectWallet: () => {},
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
    const [{ wallet }, connect, disconnect, updateBalances, setWalletModules] = useConnectWallet();
    const connectedWallets = useWallets();
    const { NETWORK_NAME } = useConstants();
    const [currentWallet, setCurrentWallet] = React.useState("");
    const [provider, setProvider] = React.useState<
        ethers.ethers.providers.Web3Provider | ethers.ethers.providers.JsonRpcProvider | undefined
    >(undefined);
    const [signer, setSigner] = React.useState<ethers.ethers.providers.JsonRpcSigner | undefined>(undefined);
    const [
        {
            chains, // the list of chains that web3-onboard was initialized with
            connectedChain, // the current chain the user's wallet is connected to
            settingChain, // boolean indicating if the chain is in the process of being set
        },
        setChain, // function to call to initiate user to switch chains in their wallet
    ] = useSetChain();

    const getBalance = async () => {
        if (!provider) return ethers.BigNumber.from(0);
        const balance = await provider.getBalance(currentWallet);
        return balance;
    };

    const connectWallet = async () => {
        const wallets = await connect();
        // TODO: Remove set user session
        if (wallets) {
            setUserSession({
                address: wallets[0].accounts[0].address,
                networkId: wallets[0].chains[0].id,
            });

            setCurrentWallet(wallets[0].accounts[0].address);
        }
    };

    async function network() {
        const chainId = 42161;
        if (!connectedChain?.id) return;
        if (connectedChain.id !== chainId.toString()) {
            try {
                await setChain({
                    chainId: chainId.toString(),
                });
            } catch (err: any) {
                // This error code indicates that the chain has not been added to MetaMask
                if (err.code === 4902) {
                    await wallet?.provider?.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainName: "Arbitrum One",
                                chainId: "0xA4B1",
                                nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
                                rpcUrls: ["https://arb1.arbitrum.io/rpc/"],
                            },
                        ],
                    });
                }
            }
        }
    }

    async function logout() {
        removeUserSession();
        setCurrentWallet("");
        if (wallet) disconnect(wallet);
    }

    const displayAccount = React.useMemo(
        () => `${currentWallet.substring(0, 6)}...${currentWallet.substring(currentWallet.length - 5)}`,
        [currentWallet]
    );

    React.useEffect(() => {
        if (!provider) {
            setProvider(new ethers.providers.JsonRpcProvider(ARBITRUM_MAINNET));
        }
    }, [provider]);

    React.useEffect(() => {
        network();
    }, [connectedChain, wallet, provider]);

    React.useEffect(() => {
        if (wallet) {
            const provider = new ethers.providers.Web3Provider(wallet.provider, "any");
            setProvider(provider);
            provider.send("eth_requestAccounts", []).then(() => {
                const signer = provider.getSigner();
                setSigner(signer);
            });
            setCurrentWallet(wallet.accounts[0].address);
        } else {
            setCurrentWallet("");
            setSigner(undefined);
        }
    }, [wallet]);

    React.useEffect(() => {
        if (!connectedWallets.length) return;

        const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);
        localStorage.setItem("connectedWallets", JSON.stringify(connectedWalletsLabelArray));
    }, [connectedWallets, wallet]);

    React.useEffect(() => {
        const previouslyConnectedWallets = JSON.parse(localStorage.getItem("connectedWallets") as string);

        if (previouslyConnectedWallets?.length) {
            connect({
                autoSelect: previouslyConnectedWallets[0],
            }).then((walletConnected) => {
                console.log("connected wallets: ", walletConnected);
            });
        }
    }, [connect]);

    const { data: balanceBigNumber, refetch: refetchBalance } = useQuery(
        ACCOUNT_BALANCE(currentWallet, currentWallet, NETWORK_NAME),
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
                currentWallet,
                connectWallet,
                networkId: connectedChain?.id ? parseInt(connectedChain.id, 16) : defaultChainId,
                logout,
                displayAccount,
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
