import { useMemo, useCallback } from "react";
import useWallet from "src/hooks/useWallet";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchTotalSupplies } from "src/state/supply/supplyReducer";
import { useDecimals } from "./useDecimals";
import { formatUnits } from "viem";

/**
 * Returns total supply for all tokens
 */
const useTotalSupplies = () => {
    const { farms } = useFarms();
    const { isLoading, totalSupplies, isFetched } = useAppSelector((state) => state.supply);
    const { chainId, client } = useWallet();
    const dispatch = useAppDispatch();
    const {
        decimals,
        isFetched: isDecimalsFetched,
        isLoading: isDecimalsLoading,
        isFetching: isDecimalsFetching,
    } = useDecimals();

    const reloadSupplies = useCallback(() => {
        dispatch(fetchTotalSupplies({ farms, client }));
    }, [farms, chainId, dispatch]);

    const formattedSupplies = useMemo(() => {
        let b: { [key: string]: number | undefined } = {};
        Object.entries(totalSupplies).map(([key, value]) => {
            // Formalize the balance
            if (!value) {
                b[key] = undefined;
                return;
            }
            const formattedBal = Number(formatUnits(BigInt(value || "0"), decimals[key] || 18));
            b[key] = formattedBal;
            return;
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
