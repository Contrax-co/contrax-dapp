import React from "react";
import { useSigner } from "wagmi";
import useWallet from "./useWallet";
import { ethers } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { addressesByChainId } from "src/config/constants/contracts";
import { buildTransaction, getBridgeStatus, getRoute } from "src/api/bridge";
import { defaultChainId } from "src/config/constants";
import { CHAIN_ID } from "src/types/enums";
import { awaitTransaction, sleep } from "src/utils/common";
import { useAppDispatch, useAppSelector } from "src/state";
import { setBeforeRampBalance, setBridgeStatus, setSourceTxHash } from "src/state/ramp/rampReducer";
import useNotify from "./useNotify";
import { BridgeStatus } from "src/state/ramp/types";
import useBalances from "./useBalances";

const useBridge = () => {
    const { getWeb3AuthSigner, currentWallet, provider } = useWallet();
    const { notifyError, notifySuccess, notifyLoading, dismissNotify, dismissNotifyAll } = useNotify();

    const { data: polygonSignerWagmi } = useSigner({
        chainId: CHAIN_ID.POLYGON,
    });
    const dispatch = useAppDispatch();
    const { sourceTxHash, status } = useAppSelector((state) => state.ramp.bridgeState);
    const [polygonSigner, setPolygonSigner] = React.useState(polygonSignerWagmi);

    const polyUsdcToUsdc = async () => {
        if (!polygonSigner) return;
        await sleep(1000);
        let notiId = notifyLoading("Loading", "initiating bridge");
        try {
            const polyUsdcBalance = await getBalance(
                addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                currentWallet,
                polygonSigner
            );
            console.log("polyUsdcBalance", polyUsdcBalance.toString());
            dispatch(setBridgeStatus(BridgeStatus.APPROVING));
            const { route, approvalData } = await getRoute(
                CHAIN_ID.POLYGON,
                CHAIN_ID.ARBITRUM,
                addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress,
                polyUsdcBalance.toString(),
                currentWallet
            );
            console.log("bridge route", route);
            console.log("checking approval");
            let notiId2 = notifyLoading("Loading", "checking approval");
            await approveErc20(
                approvalData.approvalTokenAddress,
                approvalData.allowanceTarget,
                approvalData.minimumApprovalAmount,
                currentWallet,
                polygonSigner!
            );
            dismissNotify(notiId2);
            console.log("approval done");
            dispatch(setBridgeStatus(BridgeStatus.PENDING));
            const buildTx = await buildTransaction(route);
            const tx = {
                to: buildTx?.txTarget,
                data: buildTx?.txData,
                value: buildTx?.value,
                chainId: buildTx?.chainId,
            };
            console.log("sending tx", tx);
            // const routeId: string = route.routeId;
            const { tx: transaction, error } = await awaitTransaction(polygonSigner?.sendTransaction(tx));
            dismissNotify(notiId);
            if (error) throw new Error(error);
            const hash: string = transaction.transactionHash;
            if (hash) {
                notifySuccess("Success!", "Transaction sent");
            }
            dispatch(setSourceTxHash(hash));
        } catch (error: any) {
            dismissNotifyAll();
            console.error(error);
            notifyError("Error!", error.message);
        }
    };

    const lock = async () => {
        if (status === BridgeStatus.APPROVING || status === BridgeStatus.PENDING) return;
        const usdcPolygonBalance = await getBalance(
            addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
            currentWallet,
            polygonSigner!
        );
        dispatch(
            setBeforeRampBalance({
                address: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                balance: usdcPolygonBalance.toString(),
            })
        );
    };

    React.useEffect(() => {
        const int = setInterval(() => {
            if (sourceTxHash) {
                getBridgeStatus(sourceTxHash, CHAIN_ID.POLYGON, CHAIN_ID.ARBITRUM).then((res) => {
                    console.log(res);
                    if (res.destinationTxStatus === "COMPLETED") {
                        notifySuccess("Success!", "Briging completed");
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

    return { polyUsdcToUsdc, lock };
};

export default useBridge;
