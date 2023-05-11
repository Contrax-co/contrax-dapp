import React, { useCallback } from "react";
import { useSigner } from "wagmi";
import useWallet from "./useWallet";
import { ethers } from "ethers";
import { CHAIN_ID } from "src/types/enums";
import { useAppDispatch, useAppSelector } from "src/state";
import { checkBridgeStatus, polyUsdcToArbUsdc } from "src/state/ramp/rampReducer";

const useBridge = () => {
    const { getWeb3AuthSigner, currentWallet } = useWallet();
    const isLoading = useAppSelector((state) => state.ramp.bridgeState.isBridging);
    const checkingStatus = useAppSelector((state) => state.ramp.bridgeState.checkingStatus);

    const { data: polygonSignerWagmi } = useSigner({
        chainId: CHAIN_ID.POLYGON,
    });
    const dispatch = useAppDispatch();
    const [polygonSigner, setPolygonSigner] = React.useState(polygonSignerWagmi);

    const polyUsdcToUsdc = async () => {
        if (!polygonSigner) return;
        dispatch(polyUsdcToArbUsdc({ currentWallet, polygonSigner }));
    };

    const isBridgePending = () => {
        if (!checkingStatus) dispatch(checkBridgeStatus());
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

    return { polyUsdcToUsdc, isLoading, isBridgePending };
};

export default useBridge;
