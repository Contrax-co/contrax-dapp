import React, { useCallback } from "react";
import { useSigner } from "wagmi";
import useWallet from "./useWallet";
import { ethers } from "ethers";
import { CHAIN_ID } from "src/types/enums";
import { useAppDispatch, useAppSelector } from "src/state";
import { checkBridgeStatus, polyUsdcToArbUsdc } from "src/state/ramp/rampReducer";
import { web3AuthConnectorId } from "src/config/constants";
import { getConnectorId } from "src/utils/common";

const useBridge = () => {
    const { getWeb3AuthSigner, currentWallet, switchNetworkAsync, networkId } = useWallet();
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

    React.useEffect(() => {
        getWeb3AuthSigner(CHAIN_ID.POLYGON, polygonSigner as ethers.Signer).then((res) => {
            setPolygonSigner(res);
        });
    }, [getWeb3AuthSigner]);

    const wrongNetwork = React.useMemo(() => {
        if (networkId !== CHAIN_ID.POLYGON && getConnectorId() !== web3AuthConnectorId) {
            return true;
        }
        return false;
    }, [networkId, switchNetworkAsync]);

    return { polyUsdcToUsdc, isLoading, isBridgePending, wrongNetwork };
};

export default useBridge;
