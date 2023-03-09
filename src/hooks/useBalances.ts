import { useMemo, useCallback } from "react";
import { Multicall, ContractCallResults, ContractCallContext } from "ethereum-multicall";
import useWallet from "src/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_BALANCES } from "src/config/constants/query";
import * as ethers from "ethers";
import useConstants from "./useConstants";
import erc20 from "src/assets/abis/erc20.json";
import { isValidNetwork } from "src/utils/common";
import useFarms from "./farms/useFarms";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchBalances } from "src/state/balances/balancesReducer";

/**
 * Returns balances for all tokens
 * @param data Array of objects with address and decimals
 */
const useBalances = () => {
    const { farms } = useFarms();
    const { isLoading, balances, isFetched } = useAppSelector((state) => state.balances);
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
