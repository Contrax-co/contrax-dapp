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

    // const {setOpen} = useModal()
    const { address: currentWallet } = useAccount();
    const { disconnect } = useDisconnect();
    const { connectors } = useConnect();
    const [networkId, setNetworkId] = React.useState<number>(defaultChainId);
    const { NETWORK_NAME } = useConstants();
    const { openConnectModal } = useConnectModal();

    // React.useEffect(() => {
    //     const init = async () => {
    //         try {
    //             const web3auth = new Web3Auth({
    //                 clientId,
    //                 web3AuthNetwork: "testnet", // mainnet, aqua, celeste, cyan or testnet
    //                 chainConfig: {
    //                     chainNamespace: CHAIN_NAMESPACES.EIP155,
    //                     chainId: "0xA4B1",
    //                     rpcTarget: "https://arb1.arbitrum.io/rpc", // This is the public RPC we have added, please pass on your own endpoint while creating an app
    //                     blockExplorer: "https://arbiscan.io/",
    //                     displayName: "Arbitrum One",
    //                     ticker: "ETH",
    //                     tickerName: "Ether",
    //                 },
    //             });
    //             const metamaskAdapter = new MetamaskAdapter({
    //                 sessionTime: 3600, // 1 hour in seconds
    //             });

    //             const openloginAdapter = new OpenloginAdapter({
    //                 loginSettings: {
    //                     mfaLevel: "none", // Pass on the mfa level of your choice: default, optional, mandatory, none
    //                 },
    //             });
    //             const walletConnectV1Adapter = new WalletConnectV1Adapter({
    //                 adapterSettings: {
    //                     bridge: "https://bridge.walletconnect.org",
    //                 },
    //                 sessionTime: 3600, // 1 day in seconds
    //             });

    //             web3auth.configureAdapter(walletConnectV1Adapter);
    //             web3auth.configureAdapter(openloginAdapter);
    //             web3auth.configureAdapter(metamaskAdapter);

    //             setWeb3auth(web3auth);

    //             await web3auth.initModal();

    //             if (web3auth.provider) {
    //                 const _provider = new ethers.providers.Web3Provider(web3auth.provider);
    //                 setProvider(_provider);
    //             }
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };

    //     init();
    // }, []);

    const getBalance = async () => {
        if (!provider || !currentWallet) return ethers.BigNumber.from(0);
        const balance = await provider.getBalance(currentWallet);
        return balance;
    };

    const connectWallet = async () => {
        if (openConnectModal) openConnectModal();

        return false;
        // await connectAsync({
        //     connector: connectors[0],
        //     chainId: defaultChainId,
        // });
    };

    // async function network() {
    //     const chainId = 42161;
    //     if (!connectedChain?.id) return;
    //     if (connectedChain.id !== chainId.toString()) {
    //         try {
    //             web3auth.
    //         } catch (err: any) {
    //             // This error code indicates that the chain has not been added to MetaMask
    //             if (err.code === 4902) {
    //                 await wallet?.provider?.request({
    //                     method: "wallet_addEthereumChain",
    //                     params: [
    //                         {
    //                             chainName: "Arbitrum One",
    //                             chainId: "0xA4B1",
    //                             nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    //                             rpcUrls: ["https://arb1.arbitrum.io/rpc/"],
    //                         },
    //                     ],
    //                 });
    //             }
    //         }
    //     }
    // }

    async function logout() {
        disconnect();
    }

    const displayAccount = React.useMemo(
        () => `${currentWallet?.substring(0, 6)}...${currentWallet?.substring(currentWallet.length - 5)}`,
        [currentWallet]
    );

    // React.useEffect(() => {
    //     network();
    // }, [connectedChain, wallet, provider]);

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
