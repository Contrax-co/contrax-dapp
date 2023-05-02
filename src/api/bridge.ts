import { CHAIN_ID } from "src/types/enums";
import { socketTechApi } from ".";
import { addressesByChainId } from "src/config/constants/contracts";

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

interface ApprovalData {
    allowanceTarget: string;
    approvalTokenAddress: string;
    minimumApprovalAmount: string;
    owner: string;
}

interface BuildTxResponse {
    approvalData: ApprovalData;
    chainId: number;
    txData: string;
    txTarget: string;
    txType: string;
    userTxIndex: number;
    userTxType: string;
    value: string;
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

export const getRoute = async (
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    fromAmount: string,
    userAddress: string
) => {
    const res = await socketTechApi.get(
        `quote?fromChainId=${fromChainId}&toChainId=${toChainId}&fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&fromAmount=${fromAmount}&userAddress=${userAddress}&uniqueRoutesPerBridge=true&sort=output&singleTxOnly=true`
    );
    const route = res.data.result.routes[0] as any;
    const approvalData = res.data.result.routes[0].userTxs[0].approvalData as ApprovalData;

    return { route, approvalData };
};

export const buildTransaction = async (route: any) => {
    const res = await socketTechApi.post("build-tx", { route });
    return res.data.result as BuildTxResponse | undefined;
};

export const getActiveRoutes = async (userAddress: string) => {
    let res = await socketTechApi.get(
        `route/active-routes/users?userAddress=${userAddress}&fromChainId=${CHAIN_ID.POLYGON}&toChainId=${
            CHAIN_ID.ARBITRUM
        }&fromTokenAddress=${addressesByChainId[CHAIN_ID.POLYGON].usdcAddress}&toTokenAddress=${
            addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress
        }`
    );
    console.log(res.data.result);
    res = await socketTechApi.get(
        `bridge-status?transactionHash=${"0x21bfc1b318fe94d575dbb4b3797a3cf3778e0963c6b4c9909f11b8522833daa3"}&fromChainId=${
            CHAIN_ID.POLYGON
        }&toChainId=${CHAIN_ID.ARBITRUM}`
    );
    console.log(res.data);
};
