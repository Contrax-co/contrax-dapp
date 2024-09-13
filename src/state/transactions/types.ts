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

export enum BridgeService {
    LIFI = "LIFI",
    SOCKET_TECH = "SOCKET_TECH",
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
        beforeBridgeBalance: string;
    } & ({ bridgeService: BridgeService.LIFI; tool: string } | { bridgeService: BridgeService.SOCKET_TECH });
}
