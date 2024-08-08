import { useMemo, useCallback } from "react";
import useWallet from "src/hooks/useWallet";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchTotalSupplies } from "src/state/supply/supplyReducer";
import { useDecimals } from "./useDecimals";
import { Address, formatUnits } from "viem";

/**
 * Returns total supply for all tokens
 */
const useTotalSupplies = () => {
    const { farms } = useFarms();
    const { isLoading, totalSupplies, isFetched } = useAppSelector((state) => state.supply);
    const { getPublicClient } = useWallet();
    const dispatch = useAppDispatch();
    const {
        decimals,
        isFetched: isDecimalsFetched,
        isLoading: isDecimalsLoading,
        isFetching: isDecimalsFetching,
    } = useDecimals();

    const reloadSupplies = useCallback(() => {
        dispatch(fetchTotalSupplies({ farms, getPublicClient }));
    }, [farms, dispatch]);

    const formattedSupplies = useMemo(() => {
        let b: { [chainId: number]: Record<Address, number> } = {};
        Object.entries(totalSupplies).map(([chainId, values]) => {
            b[Number(chainId)] = {};
            Object.entries(values).forEach(([address, value]: [address: Address, value: string]) => {
                b[Number(chainId)][address] = Number(
                    formatUnits(BigInt(value), decimals[Number(chainId)][address] || 18)
                );
            });
        });
        return b;
    }, [totalSupplies]);

    return {
        totalSupplies,
        reloadSupplies,
        formattedSupplies,
        isLoading: (isLoading || isDecimalsLoading) && !isFetched && !isDecimalsFetched,
        isFetched: isFetched && isDecimalsFetched,
        isFetching: isLoading || isDecimalsFetching,
    };
};

export default useTotalSupplies;
