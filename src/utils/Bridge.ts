import { approveErc20 } from "src/api/token";
import { SupportedChains } from "src/config/walletConfig";
import { IClients } from "src/types";
import { CHAIN_ID } from "src/types/enums";
import {
    Address,
    createPublicClient,
    Hex,
    http,
    zeroAddress,
    padHex,
    parseEventLogs,
    encodeFunctionData,
    parseUnits,
    formatUnits,
    numberToHex,
} from "viem";
import { waitForMessageReceived } from "@layerzerolabs/scan-client";
import { addressesByChainId } from "src/config/constants/contracts";
import { getAllowanceSlot } from "src/config/constants/storageSlots";

class Bridge {
    private currentWallet: Address;
    private fromToken: Address;
    private toToken: Address;
    public toChainId: number;
    public fromChainId: number;
    private notificationId: string;
    private getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
    public fromTokenAmount: bigint;
    public srcTxHash: Hex;
    // To be populated when init bridging
    public nativeFee: bigint;
    private primaryNativePrice: number;

    constructor(
        currentWallet: Address,
        fromChainId: number,
        fromToken: Address,
        toChainId: number,
        toToken: Address,
        fromTokenAmount: bigint,
        notificationId: string,
        getWalletClient: (chainId: number) => Promise<IClients["wallet"]>,
        primaryNativePrice: number
    ) {
        this.currentWallet = currentWallet;
        this.fromToken = fromToken;
        this.toToken = toToken;
        this.toChainId = toChainId;
        this.fromChainId = fromChainId;
        this.fromTokenAmount = fromTokenAmount;
        this.notificationId = notificationId;
        this.getWalletClient = getWalletClient;
        this.primaryNativePrice = primaryNativePrice;
    }

    /** Step 1 */
    public async approve() {
        const { bridgeAddr, usdcAddr, zapperBridge } = this.getBridgeAndUsdcAddr();
        if (usdcAddr === zeroAddress) return { status: true };
        else
            return await approveErc20(
                usdcAddr,
                zapperBridge,
                this.fromTokenAmount + 3000000n,
                this.currentWallet,
                this.fromChainId,
                this.getPublicClient,
                this.getWalletClient
            );
    }

    public async estimateAmountOut() {
        const { bridgeAddr } = this.getBridgeAndUsdcAddr();
        const publicClient = this.getPublicClient(this.fromChainId);

        if (this.toChainId === CHAIN_ID.CORE || this.fromChainId === CHAIN_ID.CORE) {
            return { amountOut: this.fromTokenAmount };
        } else {
            const { value, fees } = await this.getStargateFees();
            const slot = getAllowanceSlot(this.fromChainId, this.fromToken, this.currentWallet, bridgeAddr);
            const { result } = await publicClient.simulateContract({
                account: this.currentWallet,
                address: bridgeAddr as Address,
                abi: StargateAbi,
                functionName: "send",
                args: [
                    {
                        amountLD: this.fromTokenAmount,
                        composeMsg: "0x",
                        dstEid: this.getLayerZeroEid(this.toChainId),
                        extraOptions: "0x",
                        minAmountLD: 0n,
                        oftCmd: "0x",
                        to: padHex(this.currentWallet, { size: 32 }),
                    },
                    fees,
                    this.currentWallet,
                ],
                value,
                stateOverride: [
                    {
                        address: this.fromToken,
                        stateDiff: [
                            {
                                slot,
                                value: numberToHex(this.fromTokenAmount, { size: 32 }),
                            },
                        ],
                    },
                ],
            });
            return { amountOut: result[1].amountReceivedLD };
        }
    }

    private async getStargateFees() {
        const { bridgeAddr } = this.getBridgeAndUsdcAddr();
        const publicClient = this.getPublicClient(this.fromChainId);
        const fees = await publicClient.readContract({
            abi: StargateAbi,
            address: bridgeAddr,
            functionName: "quoteSend",
            args: [
                {
                    amountLD: this.fromTokenAmount,
                    composeMsg: "0x",
                    dstEid: this.getLayerZeroEid(this.toChainId),
                    extraOptions: "0x",
                    minAmountLD: 0n,
                    oftCmd: "0x",
                    to: padHex(this.currentWallet, { size: 32 }),
                },
                false,
            ],
        });
        let value = fees.nativeFee;
        if (this.fromToken === zeroAddress) value += this.fromTokenAmount;

        return { fees, value };
    }

    private async initializeStargate() {
        const { bridgeAddr, zapperBridge } = this.getBridgeAndUsdcAddr();
        const { fees } = await this.getStargateFees();

        const walletClient = await this.getWalletClient(this.fromChainId);

        this.nativeFee = fees.nativeFee;

        const calldata = encodeFunctionData({
            abi: StargateAbi,
            functionName: "send",
            args: [
                {
                    amountLD: this.fromTokenAmount,
                    composeMsg: "0x",
                    dstEid: this.getLayerZeroEid(this.toChainId),
                    extraOptions: "0x",
                    minAmountLD: 0n,
                    oftCmd: "0x",
                    to: padHex(this.currentWallet, { size: 32 }),
                },
                fees,
                this.currentWallet,
            ],
        });
        const txHash = await walletClient.writeContract({
            abi: ZapperAbi,
            address: zapperBridge,
            functionName: "zapIn",
            args: [bridgeAddr, calldata, this.nativeToUsdcFee(fees.nativeFee), fees.nativeFee, this.fromTokenAmount],
            value: 0n,
        });
        this.srcTxHash = txHash;
        return txHash;
    }

    /** Step 2. Core Bridge only usdc to usdc.c or usdc.c to usdc */
    private async initializeCore() {
        if (!(this.fromChainId === CHAIN_ID.CORE || this.toChainId === CHAIN_ID.CORE)) throw new Error("Invalid Chain");

        // Get Address of Orignal Token Bridge
        // Get Address of USDC for to chain
        const { bridgeAddr, usdcAddr, zapperBridge } = this.getBridgeAndUsdcAddr();

        const publicClient = this.getPublicClient(this.fromChainId);
        // #region To Core
        if (this.toChainId === CHAIN_ID.CORE) {
            // Get Native Fees Quote
            const [nativeFee] = await publicClient.readContract({
                abi: CoreBridgeAbi,
                address: bridgeAddr,
                functionName: "estimateBridgeFee",
                args: [false, "0x"],
            });
            this.nativeFee = nativeFee;

            const walletClient = await this.getWalletClient(this.fromChainId);
            const calldata = encodeFunctionData({
                abi: CoreBridgeAbi,
                functionName: "bridge",
                args: [
                    usdcAddr,
                    this.fromTokenAmount,
                    this.currentWallet,
                    { refundAddress: this.currentWallet, zroPaymentAddress: zeroAddress },
                    "0x",
                ],
            });
            const txHash = await walletClient.writeContract({
                abi: ZapperAbi,
                address: zapperBridge,
                functionName: "zapIn",
                args: [bridgeAddr, calldata, this.nativeToUsdcFee(nativeFee), nativeFee, this.fromTokenAmount],
                value: 0n,
            });

            this.srcTxHash = txHash;
            return txHash;
            // Wait for LayerZeroTx
        }
        // #endregion To Core
        else {
            // Get Native Fees Quote
            const [nativeFee] = await publicClient.readContract({
                abi: CoreBridgeCoreMainnetAbi,
                address: bridgeAddr,
                functionName: "estimateBridgeFee",
                args: [this.getLayerZeroEid(this.toChainId) % 1000, false, "0x"],
            });

            const walletClient = await this.getWalletClient(this.fromChainId);

            const calldata = encodeFunctionData({
                abi: CoreBridgeCoreMainnetAbi,
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
            });
            const txHash = await walletClient.writeContract({
                abi: ZapperAbi,
                address: zapperBridge,
                functionName: "zapIn",
                args: [bridgeAddr, calldata, this.nativeToUsdcFee(nativeFee), nativeFee, this.fromTokenAmount],
                value: 0n,
            });

            this.srcTxHash = txHash;
            return txHash;
        }
    }

    /** Step 3 */
    public async waitForLayerZeroTx(
        srcChainId: number = this.fromChainId,
        srcTxHash: Hex = this.srcTxHash
    ): Promise<{
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
        const publicClient = this.getPublicClient(srcChainId);
        const { status } = await publicClient.waitForTransactionReceipt({ hash: srcTxHash });
        if (status === "reverted") throw new Error("Transaction Reverted");
        const message = await waitForMessageReceived(this.getLayerZeroEid(srcChainId), srcTxHash);
        return message;
    }

    /** Step 2 */
    public async initialize() {
        if (this.toChainId === CHAIN_ID.CORE || this.fromChainId === CHAIN_ID.CORE) {
            return await this.initializeCore();
        } else {
            return await this.initializeStargate();
        }
    }

    /** Gets you the amount of tokens received on the dst chain after bridge */
    public async waitAndGetDstAmt(
        fromChainId: number = this.fromChainId,
        toChainId: number = this.toChainId,
        srcTxHash: Hex = this.srcTxHash
    ) {
        const publicClient = this.getPublicClient(toChainId);
        const message = await this.waitForLayerZeroTx(fromChainId, srcTxHash);
        const receipt = await publicClient.getTransactionReceipt({ hash: message.dstTxHash as Hex });

        if (toChainId === CHAIN_ID.CORE || fromChainId === CHAIN_ID.CORE) {
            if (toChainId === CHAIN_ID.CORE) {
                const logs = parseEventLogs({
                    logs: receipt.logs,
                    abi: CoreBridgeCoreMainnetAbi,
                    eventName: "WrapToken",
                });
                const log = logs.find((item) => item.eventName === "WrapToken");
                if (log) {
                    return { receivedToken: log.args.amount, dstTxHash: message.dstTxHash };
                }
            } else {
                const logs = parseEventLogs({
                    logs: receipt.logs,
                    abi: CoreBridgeAbi,
                    eventName: "ReceiveToken",
                });
                const log = logs.find((item) => item.eventName === "ReceiveToken");
                if (log) {
                    return { receivedToken: log.args.amount, dstTxHash: message.dstTxHash };
                }
            }
        } else {
            const logs = parseEventLogs({
                logs: receipt.logs,
                abi: StargateAbi,
                eventName: "OFTReceived",
            });
            const log = logs.find((item) => item.eventName === "OFTReceived");
            if (log) {
                return { receivedToken: log.args.amountReceivedLD, dstTxHash: message.dstTxHash };
            }
        }
    }

    private getBridgeAndUsdcAddr(): { bridgeAddr: Address; usdcAddr: Address; zapperBridge: Address } {
        let bridgeAddr = "" as Address;
        let usdcAddr = "" as Address;
        let zapperBridge = "" as Address;
        if (this.fromChainId === CHAIN_ID.CORE || this.toChainId === CHAIN_ID.CORE) {
            bridgeAddr = this.getCoreBridgeAddr(this.fromChainId).bridgeAddr;
            zapperBridge = this.getCoreBridgeAddr(this.fromChainId).zapperBridge;
            usdcAddr = this.getUsdcAddress(this.fromChainId);
        } else {
            if (this.fromChainId === CHAIN_ID.ARBITRUM) {
                zapperBridge = "0x95f368B55AB8eAbE29491C0e9DA38Def6A302868";
                if (this.fromToken === zeroAddress) {
                    bridgeAddr = "0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F";
                    usdcAddr = zeroAddress;
                } else {
                    bridgeAddr = "0xe8CDF27AcD73a434D661C84887215F7598e7d0d3";
                    usdcAddr = addressesByChainId[this.fromChainId].usdcAddress;
                }
            } else if (this.fromChainId === CHAIN_ID.BASE) {
                zapperBridge = "0x914fEf038fE15A3a5b631358Ff4251FAC2d7Dc6b";
                if (this.fromToken === zeroAddress) {
                    bridgeAddr = "0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7";
                    usdcAddr = zeroAddress;
                } else {
                    bridgeAddr = "0x27a16dc786820B16E5c9028b75B99F6f604b5d26";
                    usdcAddr = addressesByChainId[this.fromChainId].usdcAddress;
                }
            }
        }
        if (!bridgeAddr || !usdcAddr || !zapperBridge) throw new Error("Invalid Chain");
        return { bridgeAddr, usdcAddr, zapperBridge };
    }

    private getCoreBridgeAddr(srcChainId: number) {
        let bridgeAddr = "" as Address;
        let zapperBridge = "" as Address;
        switch (srcChainId) {
            case CHAIN_ID.ARBITRUM:
                zapperBridge = "0x95f368B55AB8eAbE29491C0e9DA38Def6A302868";
                bridgeAddr = "0x29d096cD18C0dA7500295f082da73316d704031A";
                break;
            case CHAIN_ID.BASE:
                zapperBridge = "0x914fEf038fE15A3a5b631358Ff4251FAC2d7Dc6b";
                bridgeAddr = "0x84FB2086Fed7b3c9b3a4Bc559f60fFaA91507879";
                break;
            case CHAIN_ID.CORE:
                zapperBridge = "0xcB83907995a41f8406b2De1122ecbc24bf2D311c";
                bridgeAddr = "0xA4218e1F39DA4AaDaC971066458Db56e901bcbdE";
                break;
            default:
                throw new Error("Invalid Chain");
        }
        return { bridgeAddr, zapperBridge };
    }

    private getLayerZeroEid(chainId: number) {
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

    private getUsdcAddress(chainId: number) {
        const addr = addressesByChainId[chainId].nativeUsdAddress;
        if (!addr) throw new Error("Invalid Chain");
        return addr;
    }

    private getPublicClient(chainId: number) {
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

    private nativeToUsdcFee(amount: bigint) {
        return parseUnits((Number(formatUnits(amount, 18)) * this.primaryNativePrice * 1.1).toString(), 6);
    }
}

export default Bridge;

const ZapperAbi = [
    {
        inputs: [
            { internalType: "address", name: "_callingContractAddress", type: "address" },
            { internalType: "bytes", name: "_data", type: "bytes" },
            { internalType: "uint256", name: "_usdcAmountToZap", type: "uint256" },
            { internalType: "uint256", name: "_ethAmountOut", type: "uint256" },
            { internalType: "uint256", name: "_usdcAmountIn", type: "uint256" },
        ],
        name: "zapIn",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "payable",
        type: "function",
    },
] as const;

const CoreBridgeAbi = [
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: "address", name: "token", type: "address" },
            { indexed: false, internalType: "address", name: "to", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "ReceiveToken",
        type: "event",
    },
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
        inputs: [
            { indexed: false, name: "localToken", internalType: "address", type: "address" },
            { indexed: false, name: "remoteToken", internalType: "address", type: "address" },
            { indexed: false, name: "remoteChainId", internalType: "uint16", type: "uint16" },
            { indexed: false, name: "to", internalType: "address", type: "address" },
            { indexed: false, name: "amount", internalType: "uint256", type: "uint256" },
        ],
        name: "WrapToken",
        anonymous: false,
        type: "event",
    },
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

const StargateAbi = [
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "bytes32", name: "guid", type: "bytes32" },
            { indexed: false, internalType: "uint32", name: "srcEid", type: "uint32" },
            { indexed: true, internalType: "address", name: "toAddress", type: "address" },
            { indexed: false, internalType: "uint256", name: "amountReceivedLD", type: "uint256" },
        ],
        name: "OFTReceived",
        type: "event",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "uint32", name: "dstEid", type: "uint32" },
                    { internalType: "bytes32", name: "to", type: "bytes32" },
                    { internalType: "uint256", name: "amountLD", type: "uint256" },
                    { internalType: "uint256", name: "minAmountLD", type: "uint256" },
                    { internalType: "bytes", name: "extraOptions", type: "bytes" },
                    { internalType: "bytes", name: "composeMsg", type: "bytes" },
                    { internalType: "bytes", name: "oftCmd", type: "bytes" },
                ],
                internalType: "struct SendParam",
                name: "_sendParam",
                type: "tuple",
            },
            {
                components: [
                    { internalType: "uint256", name: "nativeFee", type: "uint256" },
                    { internalType: "uint256", name: "lzTokenFee", type: "uint256" },
                ],
                internalType: "struct MessagingFee",
                name: "_fee",
                type: "tuple",
            },
            { internalType: "address", name: "_refundAddress", type: "address" },
        ],
        name: "send",
        outputs: [
            {
                components: [
                    { internalType: "bytes32", name: "guid", type: "bytes32" },
                    { internalType: "uint64", name: "nonce", type: "uint64" },
                    {
                        components: [
                            { internalType: "uint256", name: "nativeFee", type: "uint256" },
                            { internalType: "uint256", name: "lzTokenFee", type: "uint256" },
                        ],
                        internalType: "struct MessagingFee",
                        name: "fee",
                        type: "tuple",
                    },
                ],
                internalType: "struct MessagingReceipt",
                name: "msgReceipt",
                type: "tuple",
            },
            {
                components: [
                    { internalType: "uint256", name: "amountSentLD", type: "uint256" },
                    { internalType: "uint256", name: "amountReceivedLD", type: "uint256" },
                ],
                internalType: "struct OFTReceipt",
                name: "oftReceipt",
                type: "tuple",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "uint32", name: "dstEid", type: "uint32" },
                    { internalType: "bytes32", name: "to", type: "bytes32" },
                    { internalType: "uint256", name: "amountLD", type: "uint256" },
                    { internalType: "uint256", name: "minAmountLD", type: "uint256" },
                    { internalType: "bytes", name: "extraOptions", type: "bytes" },
                    { internalType: "bytes", name: "composeMsg", type: "bytes" },
                    { internalType: "bytes", name: "oftCmd", type: "bytes" },
                ],
                internalType: "struct SendParam",
                name: "_sendParam",
                type: "tuple",
            },
            { internalType: "bool", name: "_payInLzToken", type: "bool" },
        ],
        name: "quoteSend",
        outputs: [
            {
                components: [
                    { internalType: "uint256", name: "nativeFee", type: "uint256" },
                    { internalType: "uint256", name: "lzTokenFee", type: "uint256" },
                ],
                internalType: "struct MessagingFee",
                name: "fee",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;
