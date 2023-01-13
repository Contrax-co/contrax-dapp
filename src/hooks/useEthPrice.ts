import useConstants from "./useConstants";
import usePriceOfToken from "./usePriceOfToken";

const useEthPrice = () => {
    const { CONTRACTS } = useConstants();
    return usePriceOfToken(CONTRACTS.wethAddress);
};

export default useEthPrice;
