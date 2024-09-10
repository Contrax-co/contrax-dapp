import { CHAIN_ID } from "src/types/enums";
import { socketTechApi } from ".";
import { addressesByChainId } from "src/config/constants/contracts";
import { toEth } from "src/utils/common";
import { getTokenPricesBackend } from "./token";
import { Address } from "viem";

interface Asset {
    chainId: number;
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    icon: string;
    logoURI: string;
    chainAgnosticId: string | null;
}

interface GasFees {
    gasAmount: string;
    gasLimit: number;
    asset: Asset;
    feesInUsd: number;
}

interface Protocol {
    name: string;
    displayName: string;
    icon: string;
}

interface UserTx {
    userTxType: string;
    txType: string;
    swapSlippage: number;
    chainId: number;
    protocol: Protocol;
    fromAsset: Asset;
    approvalData: SocketApprovalData;
    fromAmount: string;
    toAsset: Asset;
    toAmount: string;
    minAmountOut: string;
    gasFees: GasFees;
    sender: string;
    recipient: string;
    userTxIndex: number;
}

export interface SocketRoute {
    routeId: string;
    isOnlySwapRoute: boolean;
    fromAmount: string;
    toAmount: string;
    sender: string;
    recipient: string;
    totalUserTx: number;
    totalGasFeesInUsd: number;
    userTxs: UserTx[];
    usedDexName: string;
    outputValueInUsd: number;
    receivedValueInUsd: number;
    inputValueInUsd: number;
    maxServiceTime: number;
    serviceTime: number;
}

interface TokenList {
    address: string;
    chainAgnosticId: unknown;
    chainId: number;
    decimals: number;
    icon: string;
    logoURI: string;
    name: string;
    symbol: string;
}

export interface SocketApprovalData {
    allowanceTarget: Address;
    approvalTokenAddress: Address;
    minimumApprovalAmount: string;
    owner: string;
}

interface BuildTxResponse {
    approvalData: SocketApprovalData;
    chainId: number;
    txData: Address;
    txTarget: Address;
    txType: string;
    userTxIndex: number;
    userTxType: string;
    value: string;
}

interface StatusData {
    bridgeName: string;
    destinationTxStatus: "PENDING" | "COMPLETED";
    fromChainId: number;
    isSocketTx: boolean;
    refuel: unknown;
    sourceTransactionHash: string;
    sourceTxStatus: "PENDING" | "COMPLETED";
    toChainId: number;
    destTokenPrice?: number;
    destinationTransactionHash?: string;
    fromAmount?: string;
    fromAsset?: { chainId: number; address: string; symbol: string; name: string; decimals: number };
    recipient?: string;
    sender?: string;
    srcTokenPrice?: number;
    toAmount?: string;
    toAsset?: { chainId: number; address: string; symbol: string; name: string; decimals: number };
}

export const getFromTokenList = async (fromChainId: number, toChainId: number) => {
    const res = await socketTechApi.get(
        `token-lists/from-token-list?fromChainId=${fromChainId}&toChainId=${toChainId}`
    );
    return res.data?.result as TokenList[] | undefined;
};

export const getToTokenList = async (fromChainId: number, toChainId: number) => {
    const res = await socketTechApi.get(`token-lists/to-token-list?fromChainId=${fromChainId}&toChainId=${toChainId}`);
    return res.data?.result as TokenList[] | undefined;
};

enum ErrorStatus {
    ASSET_NOT_SUPPORTED = "ASSET_NOT_SUPPORTED",
    MIN_AMOUNT_NOT_MET = "MIN_AMOUNT_NOT_MET",
    MAX_AMOUNT_EXCEEDED = "MAX_AMOUNT_EXCEEDED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}
type ErrorObj = { [routeName: string]: { status: ErrorStatus; minAmount?: string } };

const parseError = (error: ErrorObj) => {
    let status: ErrorStatus = ErrorStatus.UNKNOWN_ERROR;
    let minAmount: string = "0";
    Object.values(error).forEach((err) => {
        if (err.status === ErrorStatus.MIN_AMOUNT_NOT_MET) {
            status = ErrorStatus.MIN_AMOUNT_NOT_MET;
            if (err.minAmount && (BigInt(err.minAmount) < BigInt(minAmount) || minAmount === "0")) {
                minAmount = err.minAmount;
            }
        }
    });
    return { status, minAmount };
};

export const getRoute = async (
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: Address,
    toTokenAddress: Address,
    fromAmount: string,
    userAddress: Address
) => {
    const res = await socketTechApi.get(
        `quote?fromChainId=${fromChainId}&toChainId=${toChainId}&fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&fromAmount=${fromAmount}&userAddress=${userAddress}&uniqueRoutesPerBridge=true&sort=time&singleTxOnly=true`
    );
    const errors: ErrorObj = res.data.result.bridgeRouteErrors;
    const routes = res.data.result.routes as SocketRoute[];
    const route = routes.sort((a, b) => {
        return a.serviceTime - b.serviceTime;
    })[0];
    // const route = routes.sort((a, b) => {
    //     return b. - a.outputValueInUsd;
    // })[0];

    // @ts-ignore
    // const route = routes.find((e) => e.userTxs.some((tx) => tx.approvalData.allowanceTarget !== ""));
    // routes.find((route) => route.usedBridgeNames[0] !== "connext" && route.usedBridgeNames[0] !== "hop") ||
    // routes.find((route) => route.usedBridgeNames[0] !== "connext") ||
    // routes[0];

    if (!route) {
        const err = parseError(errors);
        console.log("Bridge route errors: ", err);
        const priceRes = await getTokenPricesBackend();
        if (!priceRes?.[String(fromChainId)][fromTokenAddress as Address]) {
            throw new Error(`Error in getting price for bridge`);
        }
        const price = priceRes[String(fromChainId)][fromTokenAddress]!;
        const usdAmount = Number(toEth(BigInt(err.minAmount), res.data.result.fromAsset.decimals)) * price;

        if (!route)
            throw new Error(`Please bridge $${usdAmount.toFixed(2)} ${res.data.result.fromAsset.symbol} or more!`);
    }
    console.log("Available bridge routes: ", routes);
    console.log("Selected bridge route: ", route);
    const approvalData = route.userTxs[0].approvalData as SocketApprovalData;

    return { route, approvalData };
};

export const buildTransaction = async (route: any) => {
    const res = await socketTechApi.post("build-tx", { route });
    return res.data.result as BuildTxResponse | undefined;
};

export const getBridgeStatus = async (sourceTxHash: string, fromChainId: number, toChainId: number) => {
    const res = await socketTechApi.get(
        `bridge-status?transactionHash=${sourceTxHash}&fromChainId=${fromChainId}&toChainId=${toChainId}`
    );
    return res.data.result as StatusData;
};
