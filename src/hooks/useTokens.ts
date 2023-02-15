import { useState, useEffect } from "react";
import { Farm, Token } from "src/types";
import { floorToFixed, toEth } from "src/utils/common";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import ethLogo from "src/assets/images/ethereum-icon.png";
import { useProvider } from "wagmi";

export const useTokens = (): { tokens: Token[] } => {
    const ethAddress = "0x0000000000000000000000000000000000000000";
    const minDecimalPlaces = 3;
    const { farms } = useFarms();
    const [secondChainEthBalance, setSecondChainEthBalance] = useState<number>(0);
    const { balance: ethBalance, currentWallet, networkId } = useWallet();
    const {
        prices: { [ethAddress]: ethPrice },
    } = usePriceOfTokens([ethAddress]);
    const provider = useProvider({ chainId: networkId === 1 ? 42161 : 1 });

    useEffect(() => {
        provider
            .getBalance(currentWallet)
            .then((bal) => setSecondChainEthBalance(Number(toEth(bal))))
            .catch((err) => console.log(err));
    }, [provider, currentWallet]);

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
            formattedBalances[token.address] < 1 / 10 ** minDecimalPlaces
                ? formattedBalances[token.address].toPrecision(2).slice(0, -1)
                : floorToFixed(formattedBalances[token.address], minDecimalPlaces).toString();
        token.usdBalance =
            prices[token.address] * formattedBalances[token.address] < 1 / 10 ** minDecimalPlaces
                ? (prices[token.address] * formattedBalances[token.address]).toPrecision(2).slice(0, -1)
                : floorToFixed(prices[token.address] * formattedBalances[token.address], minDecimalPlaces).toString();
    }

    const ethToken: Token = {
        address: ethAddress,
        balance:
            ethBalance < 1 / 10 ** minDecimalPlaces
                ? ethBalance.toPrecision(2).slice(0, -1)
                : floorToFixed(ethBalance, minDecimalPlaces).toString(),
        decimals: 18,
        logo: ethLogo,
        name: "ETH",
        network: networkId === 1 ? "Mainnet" : "Arbitrum",
        usdBalance:
            ethBalance * ethPrice < 1 / 10 ** minDecimalPlaces
                ? (ethBalance * ethPrice).toPrecision(2).slice(0, -1)
                : floorToFixed(ethBalance * ethPrice, minDecimalPlaces).toString(),
    };
    const mainNetEthToken: Token = {
        address: ethAddress,
        balance:
            secondChainEthBalance < 1 / 10 ** minDecimalPlaces
                ? secondChainEthBalance.toPrecision(2).slice(0, -1)
                : floorToFixed(secondChainEthBalance, minDecimalPlaces).toString(),
        decimals: 18,
        logo: ethLogo,
        name: "ETH",
        network: networkId === 1 ? "Arbitrum" : "Mainnet",
        usdBalance:
            secondChainEthBalance * ethPrice < 1 / 10 ** minDecimalPlaces
                ? (secondChainEthBalance * ethPrice).toPrecision(2).slice(0, -1)
                : floorToFixed(secondChainEthBalance * ethPrice, minDecimalPlaces).toString(),
    };
    tokens.unshift(mainNetEthToken);
    tokens.unshift(ethToken);

    return { tokens };
};
