import { Farm, Token } from "src/types";
import { floorToFixed } from "src/utils/common";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";

export const useTokens = (): { tokens: Token[] } => {
    const { farms } = useFarms();
    const tokens = farms.reduce((result: Token[], farm: Farm) => {
        if (!result.find((_) => _.address === farm.token1.toLowerCase())) {
            result.push({
                address: farm.token1.toLowerCase(),
                logo: farm.logo1,
                name: farm.name1,
                balance: "",
                usdBalance: "",
                decimals: farm.decimals,
            });
        }
        if (!farm.token2) return result;
        if (!result.find((_) => _.address === farm.token2?.toLowerCase())) {
            result.push({
                address: farm.token2.toLowerCase() || "",
                logo: farm.logo2 || "",
                name: farm.name2 || "",
                balance: "",
                usdBalance: "",
                decimals: farm.decimals || 18,
            });
        }
        return result;
    }, []);
    const { prices } = usePriceOfTokens(tokens.map((token) => token.address));
    const { formattedBalances } = useBalances(
        tokens.map((token) => ({ address: token.address, decimals: token.decimals }))
    );
    for (const token of tokens) {
        token.balance =
            formattedBalances[token.address] < 0.01
                ? formattedBalances[token.address].toPrecision(2).slice(0, -1)
                : floorToFixed(formattedBalances[token.address], 2).toString();
        token.usdBalance =
            prices[token.address] * formattedBalances[token.address] < 0.01
                ? (prices[token.address] * formattedBalances[token.address]).toPrecision(2).slice(0, -1)
                : floorToFixed(prices[token.address] * formattedBalances[token.address], 2).toString();
    }
    return { tokens };
};
