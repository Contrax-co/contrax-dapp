import { Address, Hex } from "viem";

export interface StateInterface {
    transactions: Transaction[];
    limit: number;
    fetchedAll: boolean;
}

export enum BridgeService {
    LIFI = "LIFI",
    SOCKET_TECH = "SOCKET_TECH",
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
    | WaitForConfirmationStep
    | ZapOutStep;
export interface GetBridgeQuoteStep extends BaseStep {
    type: "GET_BRIDGE_QUOTE";
    name: "Get Bridge Quote";
}

export interface ApproveBridgeStep extends BaseStep {
    type: "APPROVE_BRIDGE";
    name: "Approve Bridge";
}

export interface InitiateBridgeStep extends BaseStep {
    type: "INITIATE_BRIDGE";
    name: "Initiate Bridge";
}

export interface WaitForBridgeResultsStep extends BaseStep {
    type: "WAIT_FOR_BRIDGE_RESULTS";
    name: "Waiting for bridge results";
    bridgeInfo: {
        txHash?: Hex;
        fromChain: number;
        toChain: number;
        beforeBridgeBalance: string;
    } & ({ bridgeService: BridgeService.LIFI; tool: string } | { bridgeService: BridgeService.SOCKET_TECH });
}

export interface ApproveZapStep extends BaseStep {
    type: "APPROVE_ZAP";
    name: "Approve Zap";
    txHash?: Hex;
}

export interface ZapInStep extends BaseStep {
    type: "ZAP_IN";
    name: "Zap In";
    txHash?: Hex;
}

export interface ZapOutStep extends BaseStep {
    type: "ZAP_OUT";
    name: "Zap Out";
    txHash?: Hex;
}

export interface WaitForConfirmationStep extends BaseStep {
    type: "WAIT_FOR_CONFIRMATION";
    name: "Waiting for confirmation";
    txHash: Hex;
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
}
