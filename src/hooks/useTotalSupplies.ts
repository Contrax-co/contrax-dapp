import { useMemo, useCallback } from "react";
import useWallet from "src/hooks/useWallet";
import * as ethers from "ethers";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchTotalSupplies } from "src/state/supply/supplyReducer";

/**
 * Returns total supply for all tokens
 */
const useTotalSupplies = () => {
    const { farms } = useFarms();
    const { isLoading, totalSupplies, isFetched } = useAppSelector((state) => state.supply);
    const { networkId, multicallProvider } = useWallet();
    const dispatch = useAppDispatch();

    const reloadSupplies = useCallback(() => {
        dispatch(fetchTotalSupplies({ farms, multicallProvider }));
    }, [farms, networkId, dispatch]);

    const formattedSupplies = useMemo(() => {
        let b: { [key: string]: number } = {};
        Object.entries(totalSupplies).map(([key, value]) => {
            // Formalize the balance
            const formattedBal = Number(ethers.utils.formatUnits(value.balance, value.decimals));
            b[key] = formattedBal;
            return;
        });
        return b;
    }, [totalSupplies]);

    return {
        totalSupplies,
        reloadSupplies,
        formattedSupplies,
        isLoading: isLoading && !isFetched,
        isFetched,
        isFetching: isLoading,
    };
};

export default useTotalSupplies;
