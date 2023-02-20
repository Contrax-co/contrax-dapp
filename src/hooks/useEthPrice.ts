import useConstants from "./useConstants";
import usePriceOfTokens from "./usePriceOfTokens";

const useEthPrice = () => {
    const { CONTRACTS } = useConstants();
    const {
        prices: { [CONTRACTS.wethAddress]: price },
        isLoading,
    } = usePriceOfTokens([CONTRACTS.wethAddress]);
    return { price, isLoading };
};

export default useEthPrice;
