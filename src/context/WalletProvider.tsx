import React, { useCallback, useEffect, useRef, useState } from "react";
import * as ethers from "ethers";
import { resolveDomainFromAddress } from "src/utils/common";
import { useDispatch } from "react-redux";
import { incrementErrorCount, resetErrorCount } from "src/state/error/errorReducer";
import { CHAIN_ID } from "src/types/enums";
import { SupportedChains, web3AuthInstance } from "src/config/walletConfig";
import { ENTRYPOINT_ADDRESS_V06, providerToSmartAccountSigner } from "permissionless";
import { Address, EIP1193Provider, Hex, createPublicClient, createWalletClient, custom, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { EstimateTxGasArgs, IClients } from "src/types";
import {
    createModularAccountAlchemyClient,
    AlchemyWebSigner,
    createAlchemySmartAccountClient,
    AlchemySigner,
} from "@alchemy/aa-alchemy";
import { WalletClientSigner, type SmartAccountSigner } from "@aa-sdk/core";
import { defaultChainId } from "src/config/constants";
import useWeb3Auth from "src/hooks/useWeb3Auth";
import { requestEthForGas } from "src/api";

export interface IWalletContext {
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

    getPkey: () => Promise<string | undefined>;
    domainName: null | string;
    isSponsored: boolean;
    isSocial: boolean;
    alchemySigner?: AlchemyWebSigner;
    externalChainId: number;
    switchExternalChain: (chainId: number) => Promise<void>;
    isConnecting: boolean;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
    getClients: (chainId: number) => Promise<IClients>;
    estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
    connectWeb3Auth: () => Promise<any>;
}

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
    children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSponsored] = useState(true);
    // const [isSocial, setIsSocial] = useState(false);
    const [currentWallet, setCurrentWallet] = useState<Address | undefined>();
    const [externalChainId, setExternalChainId] = useState(CHAIN_ID.ARBITRUM);
    const _publicClients = useRef<Record<number, IClients["public"]>>({});
    const _walletClients = useRef<Record<number, IClients["wallet"]>>({});
    const dispatch = useDispatch();
    const [domainName, setDomainName] = useState<null | string>(null);
    const { connect: connectWeb3Auth, disconnect: disconnectWeb3Auth, client: web3authClient } = useWeb3Auth();
    const [isSocial, setIsSocial] = useState(false);

    const switchExternalChain = async (chainId: number) => {
        const provider = web3AuthInstance.provider!;
        try {
            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x" + chainId.toString(16) }],
            });
        } catch (e: any) {
            // Code for chain not existing
            if (e.code === 4902) {
                const chain = SupportedChains.find((item) => item.id === chainId);
                if (!chain) throw new Error("Chain not supported!");
                await provider.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: "0x" + chainId.toString(16),
                            chainName: chain.name,
                            nativeCurrency: chain.nativeCurrency,
                            rpcUrls: [chain.rpcUrls.default.http[0]],
                            blockExplorerUrls: [chain.blockExplorers.default.url],
                        },
                    ],
                });
            }
            console.log(e);
        }
    };

    const getPublicClient = (chainId: number): IClients["public"] => {
        // @ts-ignore
        if (_publicClients.current[chainId]) return _publicClients.current[chainId];
        else {
            const chain = SupportedChains.find((item) => item.id === chainId);
            if (!chain) throw new Error("chain not found");
            const _publicClient = createPublicClient({
                chain: chain,
                transport: http(),
                batch: {
                    multicall: {
                        batchSize: 4096,
                        wait: 250,
                    },
                },
            }) as IClients["public"];

            _publicClients.current[chainId] = _publicClient;

            return _publicClient;
        }
    };

    // If External, check for chain and switch chain then give wallet client
    // If social return wallet client
    const getWalletClient = async (
        chainId: number,
        _isSocial: boolean | null = isSocial
    ): Promise<IClients["wallet"]> => {
        const provider = web3AuthInstance.provider;
        const pkey = await getPkey();
        if (!provider) throw new Error("provider not found");
        const chain = SupportedChains.find((item) => item.id === chainId);
        if (!chain) throw new Error("chain not found");
        if (_isSocial) {
            if (_walletClients.current[chainId]) return _walletClients.current[chainId];
            // createAlchemySmartAccountClient
            const _providerClient = createWalletClient({
                chain, // can provide a different chain here
                transport: custom(provider as any),
            });
            const signer: SmartAccountSigner = new WalletClientSigner(
                _providerClient,
                "json-rpc" // signerType
            );
            const _walletClient = createModularAccountAlchemyClient({
                apiKey: "MhcCg7EZrUvXXCLYNZS81ncK2fJh0OCc",
                chain,
                signer,
            });

            // @ts-ignore
            _walletClients.current[chainId] = _walletClient;
            // @ts-ignore
            return _walletClient;
        } else {
            const smartAccountSigner = await providerToSmartAccountSigner(provider as any);
            // TODO: switch chain, if not exists then add network then switch.
            try {
                await provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0x" + chainId.toString(16) }],
                });
            } catch (error) {
                console.error("Fix this switch network error later.");
            }
            const _walletClient = createWalletClient({
                account: pkey ? privateKeyToAccount(pkey) : smartAccountSigner.address,
                transport: pkey ? http() : custom(provider as any, {}),
                chain,
            }).extend((client) => ({
                async sendTransaction(args) {
                    const publicClient = getPublicClient(chainId);
                    const gas = await publicClient.estimateGas({
                        to: args.to,
                        data: args.data,
                        value: args.value,
                        account: smartAccountSigner.address,
                    });
                    const gasPrice = await publicClient.getGasPrice();
                    const gasToTransfer = gasPrice * gas * 3n;
                    await requestEthForGas({
                        chainId: chainId,
                        from: smartAccountSigner.address,
                        to: args.to,
                        data: args.data,
                        value: args.value,
                        ethAmountForGas: gasToTransfer,
                    });
                    return await client.sendTransaction(args);
                },
            }));
            return _walletClient;
        }
    };

    const estimateTxGas = async (args: EstimateTxGasArgs) => {
        if (!isSocial) {
            const publicClient = getPublicClient(args.chainId);
            return await publicClient.estimateGas({
                account: currentWallet,
                data: args.data,
                to: args.to,
                value: args.value ? BigInt(args.value) : undefined,
            });
        } else {
            const walletClient = await getWalletClient(args.chainId);
            // @ts-ignore
            let userOp = await walletClient.buildUserOperation({
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
            const estimate = await walletClient.estimateUserOperationGas(userOp, ENTRYPOINT_ADDRESS_V06);

            const totalEstimatedGasLimit =
                BigInt(estimate.callGasLimit) +
                BigInt(estimate.preVerificationGas) +
                BigInt(estimate.verificationGasLimit);
            return totalEstimatedGasLimit;
        }
    };

    const getClients = async (chainId: number): Promise<IClients> => {
        const wallet = await getWalletClient(chainId);
        return {
            public: getPublicClient(chainId),
            wallet,
        };
    };
    const externalWalletChainChanged = useCallback((newChain: Hex) => {
        setExternalChainId(Number(newChain));
    }, []);

    const connectWallet = async () => {
        try {
            const { client, isSocial, address, provider } = await connectWeb3Auth();
            setIsConnecting(true);
            if (!isSocial) {
                const _walletClient = await getWalletClient(externalChainId, isSocial);
                const _internalChain = (await provider.request({ method: "eth_chainId" })) as Hex;
                externalWalletChainChanged(_internalChain);
                provider.on("chainChanged", externalWalletChainChanged);
                setCurrentWallet(getAddress(_walletClient.account.address));
                setIsSocial(false);
                return;
            }

            setIsSocial(true);
            const _walletClient = await getWalletClient(externalChainId, isSocial);
            // @ts-ignore
            setCurrentWallet(getAddress(_walletClient.account.address));
        } catch (error) {
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    async function logout() {
        disconnectWeb3Auth();
        setCurrentWallet(undefined);
        _walletClients.current = {};
        web3AuthInstance.provider?.removeListener("chainChanged", externalWalletChainChanged);
    }
    const displayAccount = React.useMemo(
        () =>
            currentWallet
                ? `${currentWallet.substring(0, 6)}...${currentWallet.substring(currentWallet.length - 5)}`
                : "",
        [currentWallet]
    );
    const getPkey = async () => {
        try {
            const pkey = await web3AuthInstance.provider?.request({ method: "eth_private_key" });
            return ("0x" + pkey) as Hex;
            // return "0xNotImplemented";
        } catch (error) {
            // notifyError(errorMessages.privateKeyError());
            return;
        }
    };

    React.useEffect(() => {
        const int = setInterval(async () => {
            try {
                const _publicClient = getPublicClient(defaultChainId);
                await _publicClient.getBlockNumber();
                dispatch(resetErrorCount());
            } catch (error) {
                dispatch(incrementErrorCount());
                console.log("Error in rpc");
            }
        }, 5000);
        return () => {
            clearInterval(int);
        };
    }, []);

    React.useEffect(() => {
        if (currentWallet) {
            resolveDomainFromAddress(currentWallet).then((res) => {
                setDomainName(res);
            });
        } else {
            setDomainName(null);
        }
    }, [currentWallet]);

    useEffect(() => {
        (async function () {
            if (web3AuthInstance.status === "not_ready") {
                await web3AuthInstance.initModal();
                // @ts-ignore
                if (web3AuthInstance.status === "connected") {
                    connectWallet();
                }
            }
        })();
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
                connectWallet,
                connectWeb3Auth: connectWallet,
                isSocial,
                alchemySigner: undefined,
                logout,
                domainName,
                displayAccount: displayAccount as Address,
                getPkey,
                isSponsored,
                estimateTxGas,
                externalChainId,
                switchExternalChain,
                isConnecting,
                getPublicClient,
                getWalletClient,
                getClients,
            }}
        >
            {children}
            <iframe id="turnkey-iframe-container"></iframe>
        </WalletContext.Provider>
    );
};

export default WalletProvider;
