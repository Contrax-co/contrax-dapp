import React from "react";
import { useBalance, useSigner } from "wagmi";
import useWallet from "../useWallet";
import { constants, ethers } from "ethers";
import { CHAIN_ID } from "src/types/enums";
import { useAppDispatch, useAppSelector } from "src/state";
import { checkBridgeStatus, polyUsdcToArbUsdc } from "src/state/ramp/rampReducer";
import { web3AuthConnectorId } from "src/config/constants";
import { customCommify, getConnectorId, getNetworkName, toEth } from "src/utils/common";
import { addressesByChainId } from "src/config/constants/contracts";
import { GET_PRICE_TOKEN } from "src/config/constants/query";
import { useQuery } from "@tanstack/react-query";
import { getPrice } from "src/api/token";
import { BridgeChainInfo, BridgeDirection } from "src/state/ramp/types";

const useBridge = (direction: BridgeDirection) => {
    const { getWeb3AuthSigner, currentWallet, switchNetworkAsync, networkId } = useWallet();
    const { data: price } = useQuery({
        queryKey: GET_PRICE_TOKEN(
            getNetworkName(BridgeChainInfo[direction].sourceChainId),
            BridgeChainInfo[direction].sourceAddress
        ),
        queryFn: () => getPrice(BridgeChainInfo[direction].sourceAddress, BridgeChainInfo[direction].sourceChainId),
        refetchInterval: 60000,
    });
    const { data, refetch } = useBalance({
        address: currentWallet as `0x${string}`,
        chainId: BridgeChainInfo[direction].sourceChainId,
        token:
            BridgeChainInfo[direction].sourceAddress !== constants.AddressZero
                ? (BridgeChainInfo[direction].sourceAddress as `0x${string}`)
                : undefined,
        enabled: !!currentWallet,
    });
    const isLoading = useAppSelector((state) => state.ramp.bridgeStates[direction].isBridging);
    const checkingStatus = useAppSelector((state) => state.ramp.bridgeStates[direction].checkingStatus);

    const { data: polygonSignerWagmi } = useSigner({
        chainId: BridgeChainInfo[direction].sourceChainId,
    });

    const dispatch = useAppDispatch();
    const [polygonSigner, setPolygonSigner] = React.useState(polygonSignerWagmi);

    const startBridging = async () => {
        if (!polygonSigner) return;
        dispatch(polyUsdcToArbUsdc({ currentWallet, polygonSigner, refechBalance: refetch, direction }));
    };

    const isBridgePending = () => {
        if (!checkingStatus) dispatch(checkBridgeStatus({ direction }));
    };

    React.useEffect(() => {
        getWeb3AuthSigner(CHAIN_ID.POLYGON, polygonSigner as ethers.Signer).then((res) => {
            setPolygonSigner(res);
        });
    }, [getWeb3AuthSigner]);

    React.useEffect(() => {
        const int = setInterval(() => {
            refetch();
        }, 10000);

        return () => {
            clearInterval(int);
        };
    }, []);

    const wrongNetwork = React.useMemo(() => {
        if (networkId !== CHAIN_ID.POLYGON && getConnectorId() !== web3AuthConnectorId) {
            return true;
        }
        return false;
    }, [networkId, switchNetworkAsync, getConnectorId()]);

    const usdAmount = React.useMemo(() => {
        return Number(data?.formatted) * (price || 0);
    }, [price, data]);

    return {
        startBridging,
        isLoading,
        isBridgePending,
        wrongNetwork,
        formattedBalance: customCommify(toEth(data?.value || "0", data?.decimals)),
        usdAmount,
    };
};

export default useBridge;
