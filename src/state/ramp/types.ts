import { Signer } from "ethers";

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
        isBridging?: boolean;
    };
}

export enum BridgeStatus {
    APPROVING = "APPROVING",
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
}

export interface PolyUsdcToArbUsdcArgs {
    polygonSigner: Signer;
    currentWallet: string;
}
