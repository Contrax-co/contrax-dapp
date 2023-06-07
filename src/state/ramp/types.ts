import { Signer } from "ethers";

export interface StateInterface {
    onRampInProgress?: boolean;
    beforeRampState: {
        balances: {
            [key: string]: string;
        };
    };
    bridgeState: {
        destTxHash?: string;
        status?: BridgeStatus;
        /**
         * True for any bridging thunk in progress
         */
        isBridging?: boolean;
        checkingStatus?: boolean;
    };
    socketSourceTxHash?: string;
}

export enum BridgeStatus {
    APPROVING = "APPROVING",
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
}

export interface PolyUsdcToArbUsdcArgs {
    polygonSigner: Signer;
    currentWallet: string;
    refechBalance: Function;
}
