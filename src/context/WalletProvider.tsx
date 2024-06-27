import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as ethers from "ethers";
import { useQuery } from "@tanstack/react-query";
import { GET_PRICE_TOKEN } from "src/config/constants/query";
import { checkPaymasterApproval, getNetworkName, resolveDomainFromAddress, toEth } from "src/utils/common";
import { getMulticallProvider } from "src/config/multicall";
import { providers } from "@0xsequence/multicall/";
import useBalances from "src/hooks/useBalances";
import { useDispatch } from "react-redux";
import { incrementErrorCount, resetErrorCount } from "src/state/error/errorReducer";
import { CHAIN_ID } from "src/types/enums";
import { bundlerClient, useEthersProvider } from "src/config/walletConfig";
import { getTokenPricesBackend } from "src/api/token";
import {
    ENTRYPOINT_ADDRESS_V06,
    ENTRYPOINT_ADDRESS_V07,
    UserOperation,
    createSmartAccountClient,
    providerToSmartAccountSigner,
} from "permissionless";
import { KernelEcdsaSmartAccount, signerToEcdsaKernelSmartAccount } from "permissionless/accounts";
import {
    Account,
    Address,
    Chain,
    PublicClient,
    Transport,
    WalletClient,
    createPublicClient,
    createWalletClient,
    custom,
    http,
} from "viem";
import axios from "axios";
import { bundlersByChainId, paymastersByChainId } from "src/config/constants/urls";
// import { arbitrum, mainnet, polygon } from "viem/chains";
import { EstimateTxGasArgs, IClients } from "src/types";
import { estimateGas } from "viem/actions";
import { AlchemySigner, createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { arbitrum, mainnet, polygon } from "@alchemy/aa-core";

interface IWalletContext {
    /**
     * The current connect wallet address
     */
    currentWallet?: Address;

    /**
     * The current connected wallet address truncated
     */
    displayAccount?: Address;

    /**
     * Connect wallet modal open for connecting any wallet
     * @returns void
     */
    connectWallet: (isExternal?: true) => Promise<void>;

    /**
     * Disconnect wallet and logout user
     * @returns void
     */
    logout: () => void;
    // signer?: ethers.ethers.providers.JsonRpcSigner | ethers.ethers.Signer;
    // provider:
    //     | ethers.ethers.providers.Web3Provider
    //     | ethers.ethers.providers.JsonRpcProvider
    //     | ethers.ethers.providers.Provider;

    /**
     * Balance of the native eth that the user has
     */
    balance: number;
    setChainId: (x: number) => void;
    getPkey: () => Promise<string | undefined>;
    multicallProvider: providers.MulticallProvider;
    polygonBalance?: BalanceResult;
    mainnetBalance?: BalanceResult;
    arbitrumBalance?: BalanceResult;
    domainName: null | string;
    chainId: number;
    isSponsored: boolean;
    client: IClients;
    publicClientMainnet: PublicClient;
    publicClientPolygon: PublicClient;
    isSocial: boolean;
    alchemySigner?: AlchemySigner;
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

    const formatted = useMemo(() => toEth(BigInt(balance || "0") || 0n), [balance]);
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
    const [isConnecting, setIsConnecting] = useState(false);
    const [smartAccountClient, setSmartAccountClient] = useState<
        Awaited<ReturnType<typeof createModularAccountAlchemyClient<AlchemySigner>>> | WalletClient
    >();
    const [isSponsored] = useState(true);
    const [isSocial, setIsSocial] = useState(false);
    const [currentWallet, setCurrentWallet] = useState<Address | undefined>();
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
                    batchSize: 4096,
                    wait: 250,
                },
            },
            cacheTime: undefined,
        });
    }, [chain]);
    const publicClientMainnet = useMemo(() => {
        return createPublicClient({
            chain: mainnet,
            transport: http(),
            batch: {
                multicall: {
                    batchSize: 4096,
                    wait: 250,
                },
            },
        });
    }, [chain]);
    const publicClientPolygon = useMemo(() => {
        return createPublicClient({
            chain: polygon,
            transport: http(),
            batch: {
                multicall: {
                    batchSize: 4096,
                    wait: 250,
                },
            },
        });
    }, [chain]);
    const provider = useEthersProvider(publicClient);
    const multicallProvider = useMulticallProvider(provider);
    const { balances } = useBalances();

    const client = useMemo(
        () => ({
            public: publicClient,
            wallet: smartAccountClient,
        }),
        [publicClient, smartAccountClient]
    );

    const dispatch = useDispatch();
    const polygonBalance = useNativeBalance(CHAIN_ID.POLYGON);
    const mainnetBalance = useNativeBalance(CHAIN_ID.MAINNET);
    const arbitrumBalance = useNativeBalance(CHAIN_ID.ARBITRUM);
    const [domainName, setDomainName] = useState<null | string>(null);

    const [alchemySigner, setAlchemySigner] = useState<AlchemySigner>();

    useEffect(() => {
        const _signer = new AlchemySigner({
            client: {
                connection: {
                    jwt: "MhcCg7EZrUvXXCLYNZS81ncK2fJh0OCc",
                },
                iframeConfig: {
                    iframeContainerId: "turnkey-iframe-container",
                },
            },
        });
        setAlchemySigner(_signer);
        return () => {
            // In strict mode it was giving error that turnkey iframe exits, so in cleanup we are manually cleaning the iframe
            // @ts-ignore
            document.querySelector("#turnkey-iframe-container").innerHTML = "";
        };
    }, []);

    const connectWallet = async (isExternal = false) => {
        try {
            if (isExternal) {
                // @ts-ignore
                const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });
                const _walletClient = createWalletClient({
                    account,
                    transport: custom(window.ethereum as any),
                    chain: arbitrum,
                }).extend((client) => ({
                    estimateTxGas: (args: EstimateTxGasArgs) => {
                        return publicClient.estimateGas({
                            account: client.account,
                            data: args.data,
                            to: args.to,
                            value: args.value ? BigInt(args.value) : undefined,
                        });
                    },
                }));
                setSmartAccountClient(_walletClient);
                setCurrentWallet(_walletClient.account.address);
                setIsSocial(false);
                localStorage.setItem("window.ethereum.connected", "yes");
                return;
            }
            setIsSocial(true);
            const _walletClient = await createModularAccountAlchemyClient({
                apiKey: "MhcCg7EZrUvXXCLYNZS81ncK2fJh0OCc",
                chain: arbitrum,
                signer: alchemySigner!,
            });
            // @ts-ignore
            _walletClient.estimateTxGas = async (args: EstimateTxGasArgs) => {
                console.log("args =>", args);
                let userOp = await _walletClient.buildUserOperation({
                    uo: {
                        data: args.data,
                        target: args.to,
                        value: BigInt(args.value || "0"),
                    },
                });
                // @ts-ignore
                userOp.nonce = "0x" + userOp.nonce.toString(16);
                // @ts-ignore
                userOp.maxFeePerGas = "0x" + userOp.maxFeePerGas.toString(16);
                // @ts-ignore
                userOp.maxPriorityFeePerGas = "0x" + userOp.maxPriorityFeePerGas.toString(16);
                console.log("userOp =>", userOp);
                // @ts-ignore
                const estimate = await _walletClient.estimateUserOperationGas(userOp, ENTRYPOINT_ADDRESS_V06);

                const totalEstimatedGasLimit =
                    BigInt(estimate.callGasLimit) +
                    BigInt(estimate.preVerificationGas) +
                    BigInt(estimate.verificationGasLimit);
                return totalEstimatedGasLimit;
            };
            setCurrentWallet(_walletClient.account.address);
            setSmartAccountClient(_walletClient!);
        } catch (error) {
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    async function logout() {
        setCurrentWallet(undefined);
        localStorage.removeItem("window.ethereum.connected");
        alchemySigner!.disconnect();
    }

    const displayAccount = React.useMemo(
        () =>
            currentWallet
                ? `${currentWallet.substring(0, 6)}...${currentWallet.substring(currentWallet.length - 5)}`
                : "",
        [currentWallet]
    );

    const balance = useMemo(
        () => Number(ethers.utils.formatUnits(balances[ethers.constants.AddressZero] || 0, 18)),
        [balances]
    );

    const getPkey = async () => {
        try {
            // const pkey = await web3AuthSigner.inner.provider?.request({ method: "eth_private_key" });
            // return pkey as string;
            return "0xNotImplemented";
        } catch (error) {
            console.warn("Pkey: Not web3auth signer!");
            // notifyError(errorMessages.privateKeyError());
        }
    };
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("bundle") && alchemySigner) {
            // this will complete email auth
            alchemySigner
                .authenticate({ type: "email", bundle: urlParams.get("bundle")! })
                // redirect the user or do w/e you want once the user is authenticated
                .then(async () => {
                    await connectWallet();
                });
        }
    }, [alchemySigner]);

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
        if (smartAccountClient?.account?.address) {
            resolveDomainFromAddress(smartAccountClient.account.address).then((res) => {
                setDomainName(res);
            });
        } else {
            setDomainName(null);
        }
    }, [smartAccountClient]);

    useEffect(() => {
        const init = async () => {
            try {
                const auth = await alchemySigner!.getAuthDetails().catch(() => null);
                if (auth) {
                    connectWallet();
                } else if (window.ethereum) {
                    const yes = localStorage.getItem("window.ethereum.connected");
                    if (yes === "yes") {
                        // @ts-ignore
                        const accs = await window.ethereum.request({ method: "eth_accounts" });
                        if (accs.length > 0) {
                            connectWallet(true);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (alchemySigner) init();
    }, [alchemySigner]);

    return (
        <WalletContext.Provider
            value={{
                currentWallet,
                // currentWallet: "0x1C9057544409046f82d7d47332383a6780763EAF",
                // currentWallet: "0x6403e9d6141fb36B76521871e986d68FebBda064",
                // currentWallet: "0x74541e279fe87135e43D390aA5eaB8486fb185B9",
                // currentWallet: "0x240AEDcD6A9fD9f3CA1fE0ED2e122dA87f5836f1",
                // currentWallet: "0x71dde932c6fdfd6a2b2e9d2f4f1a2729a3d05981",
                chainId,
                connectWallet,
                isSocial,
                alchemySigner,
                logout,
                domainName,
                displayAccount: displayAccount as Address,
                balance,
                getPkey,
                multicallProvider,
                // @ts-expect-error
                client,
                publicClientMainnet,
                publicClientPolygon,
                polygonBalance,
                mainnetBalance,
                arbitrumBalance,
                isSponsored,
                setChainId,
            }}
        >
            {children}
            <iframe id="turnkey-iframe-container"></iframe>
        </WalletContext.Provider>
    );
};

export default WalletProvider;
