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
import { polyUsdcToArbUsdc, setBeforeRampBalance, setBridgeStatus, setSourceTxHash } from "src/state/ramp/rampReducer";
import useNotify from "./useNotify";
import { BridgeStatus } from "src/state/ramp/types";
import useBalances from "./useBalances";
import { v4 as uuid } from "uuid";

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
        dispatch(polyUsdcToArbUsdc({ currentWallet, polygonSigner }));
    };

    // const lock = async () => {
    //     if (status === BridgeStatus.APPROVING || status === BridgeStatus.PENDING) return;
    //     const usdcPolygonBalance = await getBalance(
    //         addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
    //         currentWallet,
    //         polygonSigner!
    //     );
    //     dispatch(
    //         setBeforeRampBalance({
    //             address: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
    //             balance: usdcPolygonBalance.toString(),
    //         })
    //     );
    // };

    React.useEffect(() => {
        getWeb3AuthSigner(CHAIN_ID.POLYGON, polygonSigner as ethers.Signer).then((res) => {
            setPolygonSigner(res);
        });
    }, [getWeb3AuthSigner]);

    return { polyUsdcToUsdc };
};

export default useBridge;
