import { useMemo, useCallback, useEffect } from "react";
import useWallet from "src/hooks/useWallet";
import * as ethers from "ethers";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import {
    fetchBalances,
    reset,
    setIsFetched,
    fetchPolygonBalances,
    fetchMainnetBalances,
} from "src/state/balances/balancesReducer";
import { useDecimals } from "./useDecimals";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { Address } from "src/types";

/**
 * Returns balances for all tokens
 * @param data Array of objects with address and decimals
 */
const useBalances = () => {
    const { farms } = useFarms();
    const {
        isLoading,
        balances,
        isFetched,
        account: oldAccount,
        polygonBalances,
        mainnetBalances,
    } = useAppSelector((state) => state.balances);
    const { networkId, currentWallet, arbitrumPublicClient, mainnetPublicClient, polygonPublicClient } = useWallet();
    const {
        decimals,
        isFetched: isDecimalsFetched,
        isLoading: isDecimalsLoading,
        isFetching: isDecimalsFetching,
    } = useDecimals();
    const dispatch = useAppDispatch();

    const reloadBalances = useCallback(() => {
        if (currentWallet) {
            dispatch(fetchBalances({ farms, account: currentWallet as Address, publicClient: arbitrumPublicClient }));
            dispatch(
                fetchPolygonBalances({
                    publicClient: polygonPublicClient,
                    account: currentWallet as Address,
                    addresses: [
                        addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                        addressesByChainId[CHAIN_ID.POLYGON].wethAddress,
                    ],
                })
            );
            dispatch(
                fetchMainnetBalances({
                    publicClient: mainnetPublicClient,
                    account: currentWallet as Address,
                    addresses: [],
                })
            );
        }
    }, [farms, currentWallet, networkId, arbitrumPublicClient, polygonPublicClient, mainnetPublicClient]);

    const formattedBalances = useMemo(() => {
        let b: { [key: string]: number | undefined } = {};
        Object.entries(balances).map(([key, value]) => {
            // Formalize the balance
            if (!value) {
                b[key] = undefined;
                return;
            }
            const formattedBal = Number(ethers.utils.formatUnits(value, decimals[key]));
            b[key] = formattedBal;
            return;
        });
        return b;
    }, [balances]);

    useEffect(() => {
        if (!currentWallet && Object.values(balances).length > 0) {
            dispatch(reset());
        }
    }, [currentWallet, balances]);

    const ethBalance = useMemo(() => ethers.BigNumber.from(balances[ethers.constants.AddressZero] || 0), [balances]);

    return {
        balances,
        reloadBalances,
        formattedBalances,
        ethBalance,
        polygonBalances,
        mainnetBalances,
        isLoading: isLoading && !isFetched && isDecimalsFetched,
        // isLoading: (isLoading || isDecimalsLoading) && !isFetched && !isDecimalsFetched,
        isFetched: isFetched && isDecimalsFetched,
        isFetching: isLoading || isDecimalsFetching,
    };
};

export default useBalances;
