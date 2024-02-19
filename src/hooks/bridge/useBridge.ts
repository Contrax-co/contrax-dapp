import React, { useMemo } from "react";
import { useBalance } from "wagmi";
import { useEthersSigner } from "src/config/walletConfig";
import useWallet from "../useWallet";
import { BigNumber, constants, ethers } from "ethers";
import { CHAIN_ID } from "src/types/enums";
import { useAppDispatch, useAppSelector } from "src/state";
import { checkBridgeStatus, polyUsdcToArbUsdc } from "src/state/ramp/rampReducer";
import { web3AuthConnectorId } from "src/config/constants";
import { customCommify, getConnectorId, getNetworkName, toEth } from "src/utils/common";
import { GET_PRICE_TOKEN } from "src/config/constants/query";
import { useQuery } from "@tanstack/react-query";
import { getPrice } from "src/api/token";
import { BridgeChainInfo, BridgeDirection } from "src/state/ramp/types";
import useBalances from "../useBalances";

const useBridge = (direction: BridgeDirection) => {
    const { getWeb3AuthSigner, currentWallet, switchNetworkAsync, networkId } = useWallet();
    const { balances, polygonBalances, reloadBalances } = useBalances();
    const { data: price } = useQuery({
        queryKey: GET_PRICE_TOKEN(
            getNetworkName(BridgeChainInfo[direction].sourceChainId),
            BridgeChainInfo[direction].sourceAddress
        ),
        queryFn: () => getPrice(BridgeChainInfo[direction].sourceAddress, BridgeChainInfo[direction].sourceChainId),
        refetchInterval: 60000,
    });

    const balance = useMemo(() => {
        if (BridgeChainInfo[direction].sourceChainId === CHAIN_ID.POLYGON) {
            return polygonBalances[BridgeChainInfo[direction].sourceAddress];
        } else if (BridgeChainInfo[direction].sourceChainId === CHAIN_ID.ARBITRUM) {
            return balances[BridgeChainInfo[direction].sourceAddress];
        }
    }, [polygonBalances, balances, direction]);

    const isLoading = useAppSelector((state) => state.ramp.bridgeStates[direction].isBridging);
    const checkingStatus = useAppSelector((state) => state.ramp.bridgeStates[direction].checkingStatus);

    const polygonSignerWagmi = useEthersSigner({
        chainId: BridgeChainInfo[direction].sourceChainId,
    });

    const dispatch = useAppDispatch();
    const [polygonSigner, setPolygonSigner] = React.useState(polygonSignerWagmi);

    const startBridging = async (polygonUSDCAmount?: BigNumber) => {
        if (!polygonSigner) return;
        dispatch(
            polyUsdcToArbUsdc({
                currentWallet,
                polygonSigner,
                refechBalance: reloadBalances,
                direction,
                polygonUSDCAmount,
            })
        );
    };

    const isBridgePending = () => {
        if (!checkingStatus) dispatch(checkBridgeStatus({ direction }));
    };
    React.useEffect(() => {
        const fn = async () => {
            const res = await getWeb3AuthSigner(CHAIN_ID.POLYGON, polygonSignerWagmi as ethers.Signer);
            // @ts-ignore
            setPolygonSigner(res);
        };
        fn();
    }, [getWeb3AuthSigner]);

    const wrongNetwork = React.useMemo(() => {
        if (networkId !== CHAIN_ID.POLYGON && getConnectorId() !== web3AuthConnectorId) {
            return true;
        }
        return false;
    }, [networkId, switchNetworkAsync, getConnectorId()]);

    const usdAmount = React.useMemo(() => {
        const formatted = toEth(balance || 0, BridgeChainInfo[direction].sourceDecimals);
        return Number(formatted) * (price || 0);
    }, [price, balance, direction]);

    const formattedBalance = React.useMemo(
        () => customCommify(toEth(balance || "0", BridgeChainInfo[direction].sourceDecimals)),
        [balance, direction]
    );

    return {
        startBridging,
        isLoading,
        isBridgePending,
        wrongNetwork,
        formattedBalance,
        usdAmount,
    };
};

export default useBridge;
