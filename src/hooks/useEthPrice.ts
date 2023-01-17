import useConstants from "./useConstants";
import usePriceOfTokens from "./usePriceOfTokens";

const useEthPrice = () => {
    const { CONTRACTS } = useConstants();
    const {
        prices: { [CONTRACTS.wethAddress]: price },
        isFetching,
    } = usePriceOfTokens([CONTRACTS.wethAddress]);
    return { price, isFetching };
};

export default useEthPrice;
