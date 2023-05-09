import { useMemo, useCallback, useEffect } from "react";
import useWallet from "src/hooks/useWallet";
import * as ethers from "ethers";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchBalances, reset, setIsFetched } from "src/state/balances/balancesReducer";
import { useDecimals } from "./useDecimals";

/**
 * Returns balances for all tokens
 * @param data Array of objects with address and decimals
 */
const useBalances = () => {
    const { farms } = useFarms();
    const { isLoading, balances, isFetched, account: oldAccount } = useAppSelector((state) => state.balances);
    const { networkId, multicallProvider, currentWallet } = useWallet();
    const {
        decimals,
        isFetched: isDecimalsFetched,
        isLoading: isDecimalsLoading,
        isFetching: isDecimalsFetching,
    } = useDecimals();
    const dispatch = useAppDispatch();

    const reloadBalances = useCallback(() => {
        if (currentWallet) dispatch(fetchBalances({ farms, multicallProvider, account: currentWallet }));
    }, [farms, currentWallet, networkId, dispatch, decimals]);

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
        if (currentWallet === "") {
            dispatch(reset());
        }
    }, [currentWallet]);

    const ethBalance = useMemo(() => ethers.BigNumber.from(balances[ethers.constants.AddressZero] || 0), [balances]);

    return {
        balances,
        reloadBalances,
        formattedBalances,
        ethBalance,
        isLoading: isLoading && !isFetched && isDecimalsFetched,
        // isLoading: (isLoading || isDecimalsLoading) && !isFetched && !isDecimalsFetched,
        isFetched: isFetched && isDecimalsFetched,
        isFetching: isLoading || isDecimalsFetching,
    };
};

export default useBalances;
