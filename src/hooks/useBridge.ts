import React from "react";
import { useSigner } from "wagmi";
import useWallet from "./useWallet";
import { ethers } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { addressesByChainId } from "src/config/constants/contracts";
import { buildTransaction, getActiveRoutes, getRoute } from "src/api/bridge";
import { defaultChainId } from "src/config/constants";
import { CHAIN_ID } from "src/types/enums";

const useBridge = () => {
    const { getWeb3AuthSigner, signer, currentWallet } = useWallet();
    const { data: polygonSignerWagmi } = useSigner({
        chainId: CHAIN_ID.POLYGON,
    });
    const [polygonSigner, setPolygonSigner] = React.useState(polygonSignerWagmi);

    const polyUsdcToUsdc = async () => {
        if (!polygonSigner) return;
        console.log("gettubg bvalance");
        const polyUsdcBalance = await getBalance(
            addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
            currentWallet,
            polygonSigner
        );
        console.log(polyUsdcBalance.toString());
        const { route, approvalData } = await getRoute(
            CHAIN_ID.POLYGON,
            CHAIN_ID.ARBITRUM,
            addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
            addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress,
            polyUsdcBalance.toString(),
            currentWallet
        );
        console.log("route");
        await approveErc20(
            approvalData.approvalTokenAddress,
            approvalData.allowanceTarget,
            approvalData.minimumApprovalAmount,
            currentWallet,
            polygonSigner!
        );
        console.log("approved");
        const buildTx = await buildTransaction(route);
        const tx = {
            to: buildTx?.txTarget,
            data: buildTx?.txData,
            value: buildTx?.value,
            chainId: buildTx?.chainId,
        };
        const routeId: string = route.routeId;
        console.log({ routeId });
        const txReceipt = await polygonSigner?.sendTransaction(tx);
        console.log(txReceipt);
        await getActiveRoutes(currentWallet);
    };

    React.useEffect(() => {
        getWeb3AuthSigner(CHAIN_ID.POLYGON, polygonSigner as ethers.Signer).then((res) => {
            setPolygonSigner(res);
        });
    }, [polygonSignerWagmi]);

    return { polyUsdcToUsdc };
};

export default useBridge;
