import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as ethers from "ethers";
import { defaultChainId, web3AuthConnectorId } from "src/config/constants";
import { useQuery } from "@tanstack/react-query";
import { GET_PRICE_TOKEN } from "src/config/constants/query";
import { getConnectorId, getNetworkName, resolveDomainFromAddress, toEth } from "src/utils/common";
import { getMulticallProvider } from "src/config/multicall";
import { providers } from "@0xsequence/multicall/";
import useBalances from "src/hooks/useBalances";
import { useDispatch } from "react-redux";
import { setConnectorId } from "src/state/settings/settingsReducer";
import { incrementErrorCount, resetErrorCount } from "src/state/error/errorReducer";
import { CHAIN_ID } from "src/types/enums";
import { bundlerClient, useEthersProvider, useEthersSigner, web3AuthInstance } from "src/config/walletConfig";
import { getTokenPricesBackend } from "src/api/token";
import {
    ENTRYPOINT_ADDRESS_V06,
    SmartAccountClient,
    UserOperation,
    createSmartAccountClient,
    providerToSmartAccountSigner,
    walletClientToSmartAccountSigner,
} from "permissionless";
import {
    BiconomySmartAccount,
    KernelEcdsaSmartAccount,
    signerToBiconomySmartAccount,
    signerToEcdsaKernelSmartAccount,
} from "permissionless/accounts";
import {
    Account,
    Address,
    Chain,
    EIP1193Provider,
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
import { arbitrum, mainnet, polygon, gnosis, fantom } from "viem/chains";
import { EstimateTxGasArgs, IClients } from "src/types";

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
    connectWallet: () => void;

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
    smartAccount?: KernelEcdsaSmartAccount<typeof ENTRYPOINT_ADDRESS_V06, Transport, Chain>;
    web3AuthClient: WalletClient<Transport, Chain, Account> | null;
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
    const [smartAccount, setSmartAccount] =
        useState<KernelEcdsaSmartAccount<typeof ENTRYPOINT_ADDRESS_V06, Transport, Chain>>();
    const [isConnecting, setIsConnecting] = useState(false);
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
    const [web3AuthClient, setWeb3AuthClient] = useState<WalletClient | null>(null);

    const sponsorUserOperation = useCallback(
        async (args: {
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
        },
        [gasInErc20, chainId]
    );

    const smartAccountClient = useMemo(() => {
        if (!smartAccount) return undefined;
        const smartAccountClient = createSmartAccountClient({
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
        }).extend((client) => ({
            // TODO: All estimategas queries should be passed through here
            // We should account for sponsorships, erc20gas, eoa, etc
            estimateTxGas: async (args: EstimateTxGasArgs) => {
                if (isSponsored) return 0n;
                const callData = await smartAccountClient.account.encodeCallData({
                    data: args.data,
                    to: args.to,
                    value: args.value || 0n,
                });
                const userOp = await client.prepareUserOperationRequest({
                    userOperation: {
                        callData,
                    },
                });
                const estimate = await bundlerClient.estimateUserOperationGas({
                    userOperation: userOp,
                });
                const totalEstimatedGasLimit =
                    estimate.callGasLimit + estimate.preVerificationGas + estimate.verificationGasLimit;
                return totalEstimatedGasLimit;
            },
            signTypedData: async (args: any) => {
                return await smartAccount.signTypedData({
                    domain: args.domain,
                    types: args.types,
                    message: args.message,
                    primaryType: args.primaryType,
                });
            },
        }));
        return smartAccountClient;
    }, [smartAccount, sponsorUserOperation]);

    const client = useMemo(
        () => ({
            public: publicClient,
            wallet: smartAccountClient!,
        }),
        [publicClient, smartAccountClient]
    );
    // const arbEipProvider = useMemo(() => {
    //     return getEip1193Provider({ public: publicClient, wallet: smartAccountClient });
    // }, [smartAccountClient, publicClient]);

    const dispatch = useDispatch();
    const polygonBalance = useNativeBalance(CHAIN_ID.POLYGON);
    const mainnetBalance = useNativeBalance(CHAIN_ID.MAINNET);
    const arbitrumBalance = useNativeBalance(CHAIN_ID.ARBITRUM);
    const [domainName, setDomainName] = useState<null | string>(null);

    const connectWallet = async () => {
        try {
            if (!web3AuthInstance.connected) {
                await web3AuthInstance.connect();
            }

            const smartAccountSigner = await providerToSmartAccountSigner(web3AuthInstance.provider as any);

            setWeb3AuthClient(
                createWalletClient({
                    account: smartAccountSigner.address,
                    transport: custom(web3AuthInstance.provider!),
                    chain: arbitrum,
                })
            );
            const smartAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
                entryPoint: ENTRYPOINT_ADDRESS_V06,
                signer: smartAccountSigner,
                // index: 0n,
            });
            setSmartAccount(smartAccount);
        } catch (error) {
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    async function logout() {
        web3AuthInstance.logout();
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

    const currentWallet = useMemo(() => smartAccount?.address, [smartAccount]);
    // console.log("currentWallet =>", currentWallet);

    const getPkey = async () => {
        try {
            const pkey = await web3AuthInstance.provider?.request({ method: "eth_private_key" });
            return pkey as string;
        } catch (error) {
            console.warn("Pkey: Not web3auth signer!");
            // notifyError(errorMessages.privateKeyError());
        }
    };

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
        const init = async () => {
            try {
                // const walletConnectModal = new WalletConnectModal({ projectId: walletConnectProjectId });
                // const walletConnectV2Adapter = new WalletConnectV2Adapter({
                //     clientId,
                //     web3AuthNetwork: "cyan",
                //     adapterSettings: {
                //         qrcodeModal: walletConnectModal,
                //         ...defaultWcSettings.adapterSettings,
                //     },
                //     loginSettings: { ...defaultWcSettings.loginSettings },
                // });
                // web3AuthInstance.configureAdapter(walletConnectV2Adapter);

                await web3AuthInstance.initModal();

                if (web3AuthInstance.connected) {
                    connectWallet();
                }
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);

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
                smartAccount,
                logout,
                domainName,
                displayAccount: displayAccount as Address,
                balance,
                getPkey,
                multicallProvider,
                client,
                publicClientMainnet,
                publicClientPolygon,
                polygonBalance,
                mainnetBalance,
                arbitrumBalance,
                isSponsored,
                setChainId,
                web3AuthClient: web3AuthClient as any,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
