import { Signer } from "ethers";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";

export interface StateInterface {
    bridgeStates: {
        [BridgeDirection.USDC_POLYGON_TO_ARBITRUM_USDC]: BridgeState;
    };
}

export interface BridgeState {
    destTxHash?: string;
    status?: BridgeStatus;
    /**
     * True for any bridging thunk in progress
     */
    isBridging?: boolean;
    checkingStatus?: boolean;
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
    direction: BridgeDirection;
}
export enum BridgeDirection {
    USDC_POLYGON_TO_ARBITRUM_USDC = "USDC_POLYGON_TO_ARBITRUM_USDC",
}

export const BridgeChainInfo = {
    [BridgeDirection.USDC_POLYGON_TO_ARBITRUM_USDC]: {
        sourceChain: "POLYGON",
        destinationChain: "ARBITRUM",
        sourceChainId: CHAIN_ID.POLYGON,
        dstChainId: CHAIN_ID.ARBITRUM,
        sourceAddress: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
        dstAddress: addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress,
    },
};
