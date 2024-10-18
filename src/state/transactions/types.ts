import { Address, Hex } from "viem";

export interface StateInterface {
    transactions: Transaction[];
    limit: number;
    fetchedAll: boolean;
}

export enum BridgeService {
    LIFI = "LIFI",
    SOCKET_TECH = "SOCKET_TECH",
    LAYER_ZERO = "LAYER_ZERO",
}

export enum TransactionStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    PENDING = "PENDING",
    INTERRUPTED = "INTERRUPTED",
}

export interface Transaction {
    _id: string;
    amountInWei: string;
    from: Address;
    type: "deposit" | "withdraw";
    farmId: number;
    tokenPrice?: number;
    vaultPrice?: number;
    token: Address;
    max: boolean;
    date: string;
    steps: TransactionStep[];
}

export type TransactionStep =
    | GetBridgeQuoteStep
    | ApproveBridgeStep
    | InitiateBridgeStep
    | WaitForBridgeResultsStep
    | ApproveZapStep
    | ZapInStep
    | ZapOutStep;

export enum TransactionTypes {
    GET_BRIDGE_QUOTE = "Get Bridge Quote",
    APPROVE_BRIDGE = "Approve Bridge",
    INITIATE_BRIDGE = "Initiate Bridge",
    WAIT_FOR_BRIDGE_RESULTS = "Waiting for bridge results",
    APPROVE_ZAP = "Approve Zap",
    ZAP_IN = "Zap In",
    ZAP_OUT = "Zap Out",
}

export interface GetBridgeQuoteStep extends BaseStep {
    type: TransactionTypes.GET_BRIDGE_QUOTE;
}

export interface ApproveBridgeStep extends BaseStep {
    type: TransactionTypes.APPROVE_BRIDGE;
}

export interface InitiateBridgeStep extends BaseStep {
    type: TransactionTypes.INITIATE_BRIDGE;
}

export interface WaitForBridgeResultsStep extends BaseStep {
    type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS;
    bridgeInfo: {
        txHash?: Hex;
        fromChain: number;
        toChain: number;
        beforeBridgeBalance: string;
        tool?: string;
    } & (
        | { bridgeService: BridgeService.LIFI; tool: string }
        | { bridgeService: BridgeService.SOCKET_TECH | BridgeService.LAYER_ZERO }
    );
}

export interface ApproveZapStep extends BaseStep {
    type: TransactionTypes.APPROVE_ZAP;
    txHash?: Hex;
}

export interface ZapInStep extends BaseStep {
    type: TransactionTypes.ZAP_IN;
    txHash?: Hex;
}

export interface ZapOutStep extends BaseStep {
    type: TransactionTypes.ZAP_OUT;
    txHash?: Hex;
}

export enum TransactionStepStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}
interface BaseStep {
    status: TransactionStepStatus;
    amount?: string;
    txHash?: Hex;
}
