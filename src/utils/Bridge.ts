import { approveErc20 } from "src/api/token";
import { SupportedChains } from "src/config/walletConfig";
import { IClients } from "src/types";
import { CHAIN_ID } from "src/types/enums";
import { Address, createPublicClient, Hex, http, zeroAddress } from "viem";
import { waitForMessageReceived } from "@layerzerolabs/scan-client";
import { addressesByChainId } from "src/config/constants/contracts";

class Bridge {
    public currentWallet: Address;
    public fromToken: Address;
    public toToken: Address;
    public toChainId: number;
    public fromChainId: number;
    public fromTokenAmount: bigint;
    public notificationId: string;
    public getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
    public srcTxHash: Hex;

    constructor(
        currentWallet: Address,
        fromToken: Address,
        toToken: Address,
        toChainId: number,
        fromChainId: number,
        fromTokenAmount: bigint,
        notificationId: string,
        getWalletClient: (chainId: number) => Promise<IClients["wallet"]>
    ) {
        this.currentWallet = currentWallet;
        this.fromToken = fromToken;
        this.toToken = toToken;
        this.toChainId = toChainId;
        this.fromChainId = fromChainId;
        this.fromTokenAmount = fromTokenAmount;
        this.notificationId = notificationId;
        this.getWalletClient = getWalletClient;
    }

    /** Step 1 */
    public async approve() {
        const { bridgeAddr, usdcAddr } = this.getBridgeAndUsdcAddr();
        return await approveErc20(
            usdcAddr,
            bridgeAddr,
            this.fromTokenAmount,
            this.currentWallet,
            this.fromChainId,
            this.getPublicClient,
            this.getWalletClient
        );
    }

    /** Step 2. Core Bridge only usdc to usdc.c or usdc.c to usdc */
    private async initializeCore() {
        if (!(this.fromChainId === CHAIN_ID.CORE || this.toChainId === CHAIN_ID.CORE)) throw new Error("Invalid Chain");

        // Get Address of Orignal Token Bridge
        // Get Address of USDC for to chain
        const { bridgeAddr, usdcAddr } = this.getBridgeAndUsdcAddr();

        const publicClient = this.getPublicClient(this.fromChainId);

        // #region From Core
        if (this.toChainId === CHAIN_ID.CORE) {
            // Get Native Fees Quote
            const [nativeFee] = await publicClient.readContract({
                abi: CoreBridgeAbi,
                address: bridgeAddr,
                functionName: "estimateBridgeFee",
                args: [false, "0x"],
            });

            const walletClient = await this.getWalletClient(this.fromChainId);
            const txHash = await walletClient.writeContract({
                abi: CoreBridgeAbi,
                address: bridgeAddr,
                functionName: "bridge",
                args: [
                    usdcAddr,
                    this.fromTokenAmount,
                    this.currentWallet,
                    { refundAddress: this.currentWallet, zroPaymentAddress: zeroAddress },
                    "0x",
                ],
                value: nativeFee,
            });
            this.srcTxHash = txHash;
            return txHash;
            // Wait for LayerZeroTx
        }
        // #endregion From Core
        else {
            // Get Native Fees Quote
            const [nativeFee] = await publicClient.readContract({
                abi: CoreBridgeCoreMainnetAbi,
                address: bridgeAddr,
                functionName: "estimateBridgeFee",
                args: [this.getLayerZeroEid(this.toChainId) % 1000, false, "0x"],
            });

            const walletClient = await this.getWalletClient(this.fromChainId);
            const txHash = await walletClient.writeContract({
                abi: CoreBridgeCoreMainnetAbi,
                address: bridgeAddr,
                functionName: "bridge",
                args: [
                    usdcAddr,
                    this.getLayerZeroEid(this.toChainId) % 1000,
                    this.fromTokenAmount,
                    this.currentWallet,
                    false,
                    { refundAddress: this.currentWallet, zroPaymentAddress: zeroAddress },
                    "0x",
                ],
                value: nativeFee,
            });
            this.srcTxHash = txHash;
            return txHash;
        }
    }

    /** Step 3 */
    public async waitForLayerZeroTx(): Promise<{
        srcUaAddress: string;
        dstUaAddress: string;
        srcChainId: number;
        dstChainId: number;
        dstTxError?: string;
        srcTxHash?: string;
        srcBlockHash?: string;
        srcBlockNumber?: string;
        srcUaNonce: number;
        status: "INFLIGHT" | "DELIVERED" | "FAILED";
        dstTxHash: string;
    }> {
        const publicClient = this.getPublicClient(this.fromChainId);
        const { status } = await publicClient.waitForTransactionReceipt({ hash: this.srcTxHash });
        if (status === "reverted") throw new Error("Transaction Reverted");
        const message = await waitForMessageReceived(this.getLayerZeroEid(this.fromChainId), this.srcTxHash);
        return message;
    }

    /** Step 1 */
    public async initialize() {
        if (this.toChainId === CHAIN_ID.CORE || this.fromChainId === CHAIN_ID.CORE) {
            return await this.initializeCore();
        }
    }

    getBridgeAndUsdcAddr(): { bridgeAddr: Address; usdcAddr: Address } {
        if (this.fromChainId === CHAIN_ID.CORE || this.toChainId === CHAIN_ID.CORE) {
            const bridgeAddr = this.getCoreBridgeAddr(this.fromChainId);
            const usdcAddr = this.getUsdcAddress(this.fromChainId);
            return { bridgeAddr, usdcAddr };
        }
        throw new Error("Invalid Chain");
    }

    getCoreBridgeAddr(srcChainId: number) {
        switch (srcChainId) {
            case CHAIN_ID.ARBITRUM:
                return "0x29d096cD18C0dA7500295f082da73316d704031A";
            case CHAIN_ID.BASE:
                return "0x84FB2086Fed7b3c9b3a4Bc559f60fFaA91507879";
            case CHAIN_ID.CORE:
                return "0xA4218e1F39DA4AaDaC971066458Db56e901bcbdE";
            default:
                throw new Error("Invalid Chain");
        }
    }

    getLayerZeroEid(chainId: number) {
        switch (chainId) {
            case CHAIN_ID.ARBITRUM:
                return 30110;
            case CHAIN_ID.BASE:
                return 30184;
            case CHAIN_ID.CORE:
                return 30153;
            default:
                throw new Error("Invalid Chain");
        }
    }

    getUsdcAddress(chainId: number) {
        const addr = addressesByChainId[chainId].nativeUsdAddress;
        if (!addr) throw new Error("Invalid Chain");
        return addr;
    }

    getPublicClient(chainId: number) {
        const chain = SupportedChains.find((item) => item.id === chainId);
        if (!chain) throw new Error("chain not found");
        const publicClient = createPublicClient({
            chain: chain,
            transport: http(),
            batch: {
                multicall: {
                    batchSize: 4096,
                    wait: 250,
                },
            },
        }) as IClients["public"];
        return publicClient;
    }
}

export default Bridge;

const CoreBridgeAbi = [
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amountLD", type: "uint256" },
            { internalType: "address", name: "to", type: "address" },
            {
                components: [
                    { internalType: "address payable", name: "refundAddress", type: "address" },
                    { internalType: "address", name: "zroPaymentAddress", type: "address" },
                ],
                internalType: "struct LzLib.CallParams",
                name: "callParams",
                type: "tuple",
            },
            { internalType: "bytes", name: "adapterParams", type: "bytes" },
        ],
        name: "bridge",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bool", name: "useZro", type: "bool" },
            { internalType: "bytes", name: "adapterParams", type: "bytes" },
        ],
        name: "estimateBridgeFee",
        outputs: [
            { internalType: "uint256", name: "nativeFee", type: "uint256" },
            { internalType: "uint256", name: "zroFee", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;

const CoreBridgeCoreMainnetAbi = [
    {
        outputs: [
            { name: "nativeFee", internalType: "uint256", type: "uint256" },
            { name: "zroFee", internalType: "uint256", type: "uint256" },
        ],
        inputs: [
            { name: "remoteChainId", internalType: "uint16", type: "uint16" },
            { name: "useZro", internalType: "bool", type: "bool" },
            { name: "adapterParams", internalType: "bytes", type: "bytes" },
        ],
        name: "estimateBridgeFee",
        stateMutability: "view",
        type: "function",
    },
    {
        outputs: [],
        inputs: [
            { name: "localToken", internalType: "address", type: "address" },
            { name: "remoteChainId", internalType: "uint16", type: "uint16" },
            { name: "amount", internalType: "uint256", type: "uint256" },
            { name: "to", internalType: "address", type: "address" },
            { name: "unwrapWeth", internalType: "bool", type: "bool" },
            {
                components: [
                    { name: "refundAddress", internalType: "address payable", type: "address" },
                    { name: "zroPaymentAddress", internalType: "address", type: "address" },
                ],
                name: "callParams",
                internalType: "struct LzLib.CallParams",
                type: "tuple",
            },
            { name: "adapterParams", internalType: "bytes", type: "bytes" },
        ],
        name: "bridge",
        stateMutability: "payable",
        type: "function",
    },
] as const;
