import { Farm, Token } from "src/types";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";

export const useTokens = (): { tokens: Token[] } => {
    const { farms } = useFarms();
    const tokens = farms.reduce((result: Token[], farm: Farm) => {
        if (!result.find((_) => _.address === farm.token1.toLowerCase())) {
            result.push({
                address: farm.token1.toLowerCase(),
                logo: farm.logo1,
                name: farm.name1,
                balance: "",
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
                decimals: farm.decimals || 18,
            });
        }
        return result;
    }, []);
    const { formattedBalances } = useBalances(
        tokens.map((token) => ({ address: token.address, decimals: token.decimals }))
    );
    for (const token of tokens) {
        token.balance = formattedBalances[token.address].toFixed(2);
    }
    return { tokens };
};
