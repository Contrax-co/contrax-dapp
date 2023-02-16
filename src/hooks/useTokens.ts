import { useState, useEffect, useMemo } from "react";
import { Farm, Token } from "src/types";
import { floorToFixed, toEth } from "src/utils/common";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import ethLogo from "src/assets/images/ethereum-icon.png";
import { constants } from "ethers";

export const useTokens = () => {
    const ethAddress = constants.AddressZero;
    const minDecimalPlaces = 3;
    const { farms } = useFarms();
    const [secondChainEthBalance, setSecondChainEthBalance] = useState(0);
    const { balance: ethBalance, networkId, mainnetBalance } = useWallet();
    const [tokens, setTokens] = useState<Token[]>([]);

    useEffect(() => {
        setSecondChainEthBalance(Number(toEth(mainnetBalance)));
    }, [mainnetBalance]);

    const tokenAddresses = useMemo(() => {
        const set = new Set<string>();
        const arr: { address: string; decimals: number }[] = [];
        for (const farm of farms) {
            set.add(farm.token1.toLowerCase());
            if (farm.token2) set.add(farm.token2.toLowerCase());
        }
        set.forEach((address) => {
            const farm = farms.find(
                (farm) => farm.token1.toLowerCase() === address || farm.token2?.toLowerCase() === address
            );
            if (farm) {
                arr.push({ address, decimals: farm.decimals });
            }
        });
        return arr;
    }, [farms]);

    const { prices } = usePriceOfTokens([ethAddress, ...tokenAddresses.map((_) => _.address)]);

    const { formattedBalances, refetch } = useBalances(tokenAddresses);

    useEffect(() => {
        const tokens: Token[] = tokenAddresses.map(({ address, decimals }) => {
            const farm = farms.find(
                (farm) => farm.token1.toLowerCase() === address || farm.token2?.toLowerCase() === address
            );
            let obj: Token = {
                address: address,
                decimals: decimals,
                balance:
                    formattedBalances[address] < 1 / 10 ** minDecimalPlaces
                        ? formattedBalances[address].toPrecision(2).slice(0, -1)
                        : floorToFixed(formattedBalances[address], minDecimalPlaces).toString(),
                usdBalance:
                    prices[address] * formattedBalances[address] < 1 / 10 ** minDecimalPlaces
                        ? (prices[address] * formattedBalances[address]).toPrecision(2).slice(0, -1)
                        : floorToFixed(prices[address] * formattedBalances[address], minDecimalPlaces).toString(),
                logo: farm?.logo1 || "",
                name: farm?.name1 || "",
            };
            return obj;
        });
        const ethToken = {
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
                ethBalance * prices[ethAddress] < 1 / 10 ** minDecimalPlaces
                    ? (ethBalance * prices[ethAddress]).toPrecision(2).slice(0, -1)
                    : floorToFixed(ethBalance * prices[ethAddress], minDecimalPlaces).toString(),
        };
        const mainNetEthToken = {
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
                secondChainEthBalance * prices[ethAddress] < 1 / 10 ** minDecimalPlaces
                    ? (secondChainEthBalance * prices[ethAddress]).toPrecision(2).slice(0, -1)
                    : floorToFixed(secondChainEthBalance * prices[ethAddress], minDecimalPlaces).toString(),
        };
        tokens.unshift(ethToken);
        tokens.unshift(mainNetEthToken);
        setTokens(tokens);
    }, [farms, formattedBalances, prices, secondChainEthBalance, tokenAddresses, farms, minDecimalPlaces, ethBalance]);

    return { tokens, refetchBalances: refetch };
};
