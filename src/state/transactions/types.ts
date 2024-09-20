import { Address, Hex } from "viem";

export interface StateInterface {
    transactions: Transaction[];
    limit: number;
    fetchedAll: boolean;
}

export enum TransactionStatus {
    PENDING = "PENDING",
    BRIDGING = "BRIDGING",
    INTERRUPTED = "INTERRUPTED",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}

export enum BridgeService {
    LIFI = "LIFI",
    SOCKET_TECH = "SOCKET_TECH",
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
