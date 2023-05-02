export interface StateInterface {
    onRampInProgress?: boolean;
    beforeRampState: {
        balances: {
            [key: string]: string;
        };
    };
    bridgeState: {
        sourceTxHash?: string;
        destTxHash?: string;
        status?: BridgeStatus;
    };
}

export enum BridgeStatus {
    APPROVING = "APPROVING",
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
}
