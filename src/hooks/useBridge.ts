import React from "react";
import { useBalance, useSigner } from "wagmi";
import useWallet from "./useWallet";
import { ethers } from "ethers";
import { CHAIN_ID } from "src/types/enums";
import { useAppDispatch, useAppSelector } from "src/state";
import { checkBridgeStatus, polyUsdcToArbUsdc } from "src/state/ramp/rampReducer";
import { web3AuthConnectorId } from "src/config/constants";
import { getConnectorId } from "src/utils/common";
import { addressesByChainId } from "src/config/constants/contracts";

const useBridge = () => {
    const { getWeb3AuthSigner, currentWallet, switchNetworkAsync, networkId } = useWallet();
    const { data, refetch } = useBalance({
        address: currentWallet as `0x${string}`,
        chainId: CHAIN_ID.POLYGON,
        watch: true,
        cacheTime: 5,
        token: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress as `0x${string}`,
    });
    const isLoading = useAppSelector((state) => state.ramp.bridgeState.isBridging);
    const checkingStatus = useAppSelector((state) => state.ramp.bridgeState.checkingStatus);

    const { data: polygonSignerWagmi } = useSigner({
        chainId: CHAIN_ID.POLYGON,
    });

    const dispatch = useAppDispatch();
    const [polygonSigner, setPolygonSigner] = React.useState(polygonSignerWagmi);

    const polyUsdcToUsdc = async () => {
        if (!polygonSigner) return;
        dispatch(polyUsdcToArbUsdc({ currentWallet, polygonSigner, refechBalance: refetch }));
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
    }, [networkId, switchNetworkAsync, getConnectorId()]);

    return { polyUsdcToUsdc, isLoading, isBridgePending, wrongNetwork, polygonUsdcBalance: data?.formatted };
};

export default useBridge;
