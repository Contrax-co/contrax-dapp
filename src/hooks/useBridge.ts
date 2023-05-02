import React from "react";
import { useSigner } from "wagmi";
import useWallet from "./useWallet";
import { ethers } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { addressesByChainId } from "src/config/constants/contracts";
import { buildTransaction, getBridgeStatus, getRoute } from "src/api/bridge";
import { defaultChainId } from "src/config/constants";
import { CHAIN_ID } from "src/types/enums";
import { awaitTransaction } from "src/utils/common";
import { useAppDispatch, useAppSelector } from "src/state";
import { setBridgeStatus, setSourceTxHash } from "src/state/ramp/rampReducer";
import useNotify from "./useNotify";
import { BridgeStatus } from "src/state/ramp/types";

const useBridge = () => {
    const { getWeb3AuthSigner, currentWallet } = useWallet();
    const { notifyError } = useNotify();
    const { data: polygonSignerWagmi } = useSigner({
        chainId: CHAIN_ID.POLYGON,
    });
    const dispatch = useAppDispatch();
    const { sourceTxHash } = useAppSelector((state) => state.ramp.bridgeState);
    const [polygonSigner, setPolygonSigner] = React.useState(polygonSignerWagmi);

    const polyUsdcToUsdc = async () => {
        if (!polygonSigner) return;
        try {
            const polyUsdcBalance = await getBalance(
                addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                currentWallet,
                polygonSigner
            );
            dispatch(setBridgeStatus(BridgeStatus.APPROVING));
            const { route, approvalData } = await getRoute(
                CHAIN_ID.POLYGON,
                CHAIN_ID.ARBITRUM,
                addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress,
                polyUsdcBalance.toString(),
                currentWallet
            );
            await approveErc20(
                approvalData.approvalTokenAddress,
                approvalData.allowanceTarget,
                approvalData.minimumApprovalAmount,
                currentWallet,
                polygonSigner!
            );
            dispatch(setBridgeStatus(BridgeStatus.PENDING));
            const buildTx = await buildTransaction(route);
            const tx = {
                to: buildTx?.txTarget,
                data: buildTx?.txData,
                value: buildTx?.value,
                chainId: buildTx?.chainId,
            };
            // const routeId: string = route.routeId;
            const { tx: transaction, error } = await awaitTransaction(polygonSigner?.sendTransaction(tx));
            if (error) throw new Error(error);
            const hash: string = transaction.transactionHash;
            dispatch(setSourceTxHash(hash));
        } catch (error: any) {
            console.error(error);
            notifyError("Error!", error.message);
        }
    };

    React.useEffect(() => {
        const int = setInterval(() => {
            if (sourceTxHash) {
                getBridgeStatus(sourceTxHash, CHAIN_ID.POLYGON, CHAIN_ID.ARBITRUM).then((res) => {
                    if (res.destinationTxStatus === "COMPLETED") {
                        dispatch(setSourceTxHash(""));
                        dispatch(setBridgeStatus(BridgeStatus.COMPLETED));
                    }
                });
            }
        }, 10000);
        return () => {
            clearInterval(int);
        };
    }, [sourceTxHash, currentWallet]);

    React.useEffect(() => {
        getWeb3AuthSigner(CHAIN_ID.POLYGON, polygonSigner as ethers.Signer).then((res) => {
            setPolygonSigner(res);
        });
    }, [getWeb3AuthSigner]);

    return { polyUsdcToUsdc };
};

export default useBridge;
