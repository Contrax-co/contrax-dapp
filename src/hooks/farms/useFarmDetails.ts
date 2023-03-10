import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import useWallet from "../useWallet";
import useFarms from "./useFarms";
import { updateFarmDetails, reset } from "src/state/farms/farmsReducer";
import useBalances from "../useBalances";
import usePriceOfTokens from "../usePriceOfTokens";

const useFarmDetails = () => {
    const { farms } = useFarms();
    const { balances, isFetched: isBalancesFetched } = useBalances();
    const { prices, isFetched: isPricesFetched } = usePriceOfTokens();
    const { isLoading, farmDetails, isFetched, account } = useAppSelector((state) => state.farms);
    const { networkId, currentWallet } = useWallet();
    const dispatch = useAppDispatch();

    const reloadFarmData = useCallback(() => {
        if (isBalancesFetched && isPricesFetched && currentWallet)
            dispatch(updateFarmDetails({ farms, currentWallet, balances, prices }));
    }, [farms, networkId, dispatch, currentWallet, balances, prices, isBalancesFetched, isPricesFetched]);

    useEffect(() => {
        if (currentWallet !== account) dispatch(reset());
    }, [account, currentWallet]);
    
    return {
        isLoading: isLoading && !isFetched,
        isFetching: isLoading,
        reloadFarmData,
        farmDetails,
    };
};

export default useFarmDetails;
