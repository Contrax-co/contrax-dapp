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
import { incrementErrorCount, resetErrorCount } from "src/state/error/errorReducer";
import { CHAIN_ID } from "src/types/enums";
import { useEthersProvider, useEthersSigner } from "src/config/walletConfig";
import { getTokenPricesBackend } from "src/api/token";
import {
    ENTRYPOINT_ADDRESS_V06,
    SmartAccountClient,
    UserOperation,
    createSmartAccountClient,
    walletClientToSmartAccountSigner,
} from "permissionless";
import {
    BiconomySmartAccount,
    KernelEcdsaSmartAccount,
    signerToBiconomySmartAccount,
    signerToEcdsaKernelSmartAccount,
} from "permissionless/accounts";
import { Address, PublicClient, Transport, createPublicClient, http } from "viem";
import axios from "axios";
import { bundlersByChainId, paymastersByChainId } from "src/config/constants/urls";
import { arbitrum, mainnet, polygon, gnosis, fantom } from "wagmi/chains";
import { EthersProviderAdapter } from "@alchemy/aa-ethers";

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
    setChainId: (x: number) => void;
    getPkey: () => Promise<string>;
    multicallProvider: providers.MulticallProvider;
    polygonBalance?: BalanceResult;
    mainnetBalance?: BalanceResult;
    arbitrumBalance?: BalanceResult;
    domainName: null | string;
    chainId: number;
    walletClient?: SmartAccountClient<typeof ENTRYPOINT_ADDRESS_V06, Transport, Chain>;
    publicClient: PublicClient;
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

const useMulticallProvider = (
    provider: ethers.ethers.providers.JsonRpcProvider | ethers.ethers.providers.FallbackProvider
) => {
    const [multicallProvider, setMulticallProvider] = useState(getMulticallProvider(provider));
    useEffect(() => {
        setMulticallProvider(getMulticallProvider(provider));
    }, [provider]);
    return multicallProvider;
};

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const { data: eoaWalletClient } = useWalletClient();
    const [smartAccount, setSmartAccount] =
        useState<KernelEcdsaSmartAccount<typeof ENTRYPOINT_ADDRESS_V06, Transport, Chain>>();
    const [isSponsored] = useState(true);
    const [gasInErc20] = useState(false);
    const [chainId, setChainId] = useState(CHAIN_ID.ARBITRUM);
    const chain = useMemo(() => {
        switch (chainId) {
            case CHAIN_ID.ARBITRUM:
                return arbitrum;
            case CHAIN_ID.POLYGON:
                return polygon;
            case CHAIN_ID.MAINNET:
                return mainnet;
            default:
                return arbitrum;
        }
    }, [chainId]);
    const publicClient = useMemo(() => {
        return createPublicClient({
            chain,
            transport: http(),
            batch: {
                multicall: {
                    batchSize: 2048,
                    wait: 500,
                },
            },
        });
    }, [chain]);
    const provider = useEthersProvider(publicClient);
    const multicallProvider = useMulticallProvider(provider);
    const { balances } = useBalances();

    const sponsorUserOperation = async (args: {
        userOperation: UserOperation<"v0.6">;
    }): Promise<{
        callGasLimit: bigint;
        verificationGasLimit: bigint;
        preVerificationGas: bigint;
        paymasterAndData: Address;
    }> => {
        let userOperation = { ...args.userOperation };
        Object.entries(userOperation).forEach(([key, val]) => {
            if (typeof val === "bigint") {
                // @ts-ignore
                userOperation[key] = val.toString();
            }
        });
        const res = await axios.post(paymastersByChainId[chainId], {
            id: 0,
            jsonrpc: "2.0",
            method: "pm_sponsorUserOperation",
            params: [userOperation, ENTRYPOINT_ADDRESS_V06, { type: gasInErc20 ? "erc20Token" : "ether" }],
        });
        return res.data.result;
    };

    const smartAccountClient = useMemo(() => {
        if (!smartAccount) return undefined;
        return createSmartAccountClient({
            account: smartAccount,
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            chain: arbitrum,
            bundlerTransport: http(bundlersByChainId[chainId]),
            middleware: isSponsored
                ? {
                      sponsorUserOperation,
                  }
                : undefined,
            cacheTime: undefined,
        });
    }, [smartAccount, sponsorUserOperation]);

    // @ts-ignore
    const signer = useEthersSigner(smartAccountClient);
    const dispatch = useDispatch();
    const { address: eoaWallet, connector, isConnecting } = useAccount();
    const { disconnect } = useDisconnect();
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
        setSmartAccount(undefined);
    }

    const displayAccount = React.useMemo(
        () =>
            smartAccount?.address
                ? `${smartAccount.address.substring(0, 6)}...${smartAccount.address.substring(
                      smartAccount.address.length - 5
                  )}`
                : "",
        [smartAccount]
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
        if (smartAccount?.address) {
            resolveDomainFromAddress(smartAccount.address).then((res) => {
                setDomainName(res);
            });
        } else {
            setDomainName(null);
        }
    }, [smartAccount]);

    useEffect(() => {
        (async function () {
            if (!eoaWalletClient || !publicClient) {
                setSmartAccount(undefined);
                return;
            }
            const smartAccountSigner = walletClientToSmartAccountSigner(eoaWalletClient);
            const smartAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
                entryPoint: ENTRYPOINT_ADDRESS_V06,
                signer: smartAccountSigner,
                // index: 0n,
            });
            setSmartAccount(smartAccount);
        })();
    }, [eoaWalletClient, publicClient]);

    return (
        <WalletContext.Provider
            value={{
                currentWallet: smartAccount?.address || "",
                // currentWallet: "0x1C9057544409046f82d7d47332383a6780763EAF",
                // currentWallet: "0x6403e9d6141fb36B76521871e986d68FebBda064",
                // currentWallet: "0x74541e279fe87135e43D390aA5eaB8486fb185B9",
                // currentWallet: "0x240AEDcD6A9fD9f3CA1fE0ED2e122dA87f5836f1",
                // currentWallet: "0x71dde932c6fdfd6a2b2e9d2f4f1a2729a3d05981",
                chainId,
                connectWallet,
                logout,
                domainName,
                displayAccount,
                signer,
                provider,
                balance,
                getPkey,
                multicallProvider,
                publicClient,
                walletClient: smartAccountClient,
                polygonBalance,
                mainnetBalance,
                arbitrumBalance,
                setChainId,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
