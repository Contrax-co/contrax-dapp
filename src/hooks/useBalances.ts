import { useMemo, useCallback, useEffect } from "react";
import useWallet from "src/hooks/useWallet";
import * as ethers from "ethers";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchBalances, reset, setIsFetched } from "src/state/balances/balancesReducer";

/**
 * Returns balances for all tokens
 * @param data Array of objects with address and decimals
 */
const useBalances = () => {
    const { farms } = useFarms();
    const { isLoading, balances, isFetched, account: oldAccount } = useAppSelector((state) => state.balances);
    const { networkId, multicallProvider, currentWallet } = useWallet();
    const dispatch = useAppDispatch();

    const reloadBalances = useCallback(() => {
        if (currentWallet) dispatch(fetchBalances({ farms, multicallProvider, account: currentWallet }));
    }, [farms, currentWallet, networkId, dispatch]);

    const formattedBalances = useMemo(() => {
        let b: { [key: string]: number } = {};
        Object.entries(balances).map(([key, value]) => {
            // Formalize the balance
            const formattedBal = Number(ethers.utils.formatUnits(value.balance, value.decimals));
            b[key] = formattedBal;
            return;
        });
        return b;
    }, [balances]);

    useEffect(() => {
        if (oldAccount !== currentWallet) {
            dispatch(reset());
        }
    }, [oldAccount, currentWallet]);

    return {
        balances,
        reloadBalances,
        formattedBalances,
        isLoading: isLoading && !isFetched,
        isFetched,
        isFetching: isLoading,
    };
};

export default useBalances;
