import { useMemo, useCallback, useEffect } from "react";
import useWallet from "src/hooks/useWallet";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchBalances, reset } from "src/state/balances/balancesReducer";
import { useDecimals } from "./useDecimals";
import { formatUnits, zeroAddress } from "viem";

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
    const { chainId, multicallProvider, currentWallet } = useWallet();
    const {
        decimals,
        isFetched: isDecimalsFetched,
        isLoading: isDecimalsLoading,
        isFetching: isDecimalsFetching,
    } = useDecimals();
    const dispatch = useAppDispatch();

    const reloadBalances = useCallback(() => {
        if (currentWallet) {
            dispatch(fetchBalances({ farms, multicallProvider, account: currentWallet }));
        }
    }, [farms, currentWallet, chainId]);

    const formattedBalances = useMemo(() => {
        let b: { [key: string]: number | undefined } = {};
        Object.entries(balances).map(([key, value]) => {
            // Formalize the balance
            if (!value) {
                b[key] = undefined;
                return;
            }
            const formattedBal = Number(formatUnits(BigInt(value), decimals[key] || 18));
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

    const ethBalance = useMemo(() => BigInt(balances[zeroAddress] || "0"), [balances]);

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
