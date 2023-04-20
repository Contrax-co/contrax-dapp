import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import useWallet from "../useWallet";
import useFarms from "./useFarms";
import { updateFarmDetails, reset, updateEarnings } from "src/state/farms/farmsReducer";
import useBalances from "../useBalances";
import usePriceOfTokens from "../usePriceOfTokens";
import { useDecimals } from "../useDecimals";
import useTotalSupplies from "../useTotalSupplies";

const useFarmDetails = () => {
    const { farms } = useFarms();
    const { balances, isFetched: isBalancesFetched } = useBalances();
    const { prices, isFetched: isPricesFetched } = usePriceOfTokens();
    const { totalSupplies } = useTotalSupplies();
    const { isLoading, farmDetails, isFetched, account, earnings, isLoadingEarnings } = useAppSelector(
        (state) => state.farms
    );
    const { decimals } = useDecimals();

    const { networkId, currentWallet, multicallProvider } = useWallet();
    const dispatch = useAppDispatch();

    const reloadFarmData = useCallback(() => {
        if (isBalancesFetched && isPricesFetched && currentWallet) {
            dispatch(updateFarmDetails({ farms, currentWallet, balances, prices, decimals }));
            dispatch(
                updateEarnings({
                    farms,
                    currentWallet,
                    decimals,
                    prices,
                    balances,
                    multicallProvider,
                    totalSupplies,
                    chainId: networkId,
                })
            );
        }
    }, [
        farms,
        networkId,
        dispatch,
        currentWallet,
        balances,
        prices,
        decimals,
        isBalancesFetched,
        isPricesFetched,
        multicallProvider,
        totalSupplies,
    ]);

    useEffect(() => {
        if (currentWallet !== account) dispatch(reset());
    }, [account, currentWallet]);

    return {
        isLoading: isLoading && !isFetched,
        isFetching: isLoading,
        reloadFarmData,
        farmDetails,
        earnings,
        isLoadingEarnings,
    };
};

export default useFarmDetails;
