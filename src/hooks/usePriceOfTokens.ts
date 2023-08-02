import { useCallback } from "react";
import useWallet from "./useWallet";
import { useAppDispatch, useAppSelector } from "src/state";
import { updatePrices } from "src/state/prices/pricesReducer";
import useFarms from "./farms/useFarms";

const usePriceOfTokens = () => {
    const { farms } = useFarms();
    const { isLoading, prices, isFetched } = useAppSelector((state) => state.prices);
    const { networkId } = useWallet();
    const dispatch = useAppDispatch();

    const reloadPrices = useCallback(() => {
        dispatch(updatePrices({ farms, chainId: networkId }));
    }, [farms, networkId, dispatch]);

    return { prices, isLoading: isLoading && !isFetched, isFetched, isFetching: isLoading, reloadPrices };
};

export default usePriceOfTokens;
