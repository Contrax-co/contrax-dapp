import { useMemo, useCallback, useEffect } from "react";
import useWallet from "src/hooks/useWallet";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchBalances, reset } from "src/state/balances/balancesReducer";
import { useDecimals } from "./useDecimals";
import { Address, formatUnits, zeroAddress } from "viem";

/**
 * Returns balances for all tokens
 * @param data Array of objects with address and decimals
 */
const useBalances = () => {
    const { farms } = useFarms();
    const { isLoading, balances, isFetched, account: oldAccount } = useAppSelector((state) => state.balances);
    const { currentWallet, getPublicClient } = useWallet();
    const {
        decimals,
        isFetched: isDecimalsFetched,
        isLoading: isDecimalsLoading,
        isFetching: isDecimalsFetching,
    } = useDecimals();
    const dispatch = useAppDispatch();
    const reloadBalances = useCallback(() => {
        if (currentWallet) {
            dispatch(fetchBalances({ farms, getPublicClient, account: currentWallet }));
        }
    }, [farms, currentWallet]);

    const formattedBalances = useMemo(() => {
        let b: { [chainId: number]: Record<Address, number> } = {};
        Object.entries(balances).map(([chainId, values]) => {
            b[Number(chainId)] = {};
            Object.entries(values).forEach(([address, value]: [address: Address, value: string]) => {
                b[Number(chainId)][address] = Number(
                    formatUnits(BigInt(value), decimals[Number(chainId)][address] || 18)
                );
            });
        });
        return b;
    }, [balances]);

    useEffect(() => {
        if (!currentWallet) {
            dispatch(reset());
        }
    }, [currentWallet]);

    return {
        balances,
        reloadBalances,
        formattedBalances,
        isLoading: isLoading && !isFetched && isDecimalsFetched,
        // isLoading: (isLoading || isDecimalsLoading) && !isFetched && !isDecimalsFetched,
        isFetched: isFetched && isDecimalsFetched,
        isFetching: isLoading || isDecimalsFetching,
    };
};

export default useBalances;
