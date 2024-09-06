import { Address, Hex } from "viem";

export interface StateInterface {
    transactions: Transaction[];
}

export enum TransactionStatus {
    PENDING = "PENDING",
    BRIDGING = "BRIDGING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}

export interface Transaction {
    id: string;
    amountInWei: string;
    type: "deposit" | "withdraw";
    farmId: number;
    token: Address;
    max: boolean;
    txHash?: Hex;
    status: TransactionStatus;
    date: string;
    bridgeInfo?: {
        txHash: Hex;
        fromChain: number;
        toChain: number;
        tool: string;
        beforeBridgeBalance: string;
    };
}
