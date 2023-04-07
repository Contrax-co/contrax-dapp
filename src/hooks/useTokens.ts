import { useState, useEffect, useMemo } from "react";
import { Token } from "src/types";
import { noExponents, toFixedFloor } from "src/utils/common";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import { constants, utils } from "ethers";
import { FarmType } from "src/types/enums";
import { useDecimals } from "./useDecimals";

const ethAddress = constants.AddressZero;
const tokenBalDecimalPlaces = 3;
const usdBalDecimalPlaces = 2;

export const useTokens = () => {
    const { farms } = useFarms();
    const { balance: ethBalance, networkId } = useWallet();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [lpTokens, setLpTokens] = useState<Token[]>([]);
    const { decimals } = useDecimals();

    const tokenAddresses = useMemo(() => {
        const set = new Set<string>();
        const arr: { address: string; decimals: number }[] = [];
        for (const farm of farms) {
            set.add(farm.token1);
            if (farm.token2) set.add(farm.token2);
        }
        set.forEach((address) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address);
            const decimal = decimals[address] || 18;
            if (farm) {
                arr.push({ address, decimals: decimal });
            }
        });
        return arr;
    }, [farms]);

    const lpAddresses = useMemo(() => {
        const set = new Set<string>();

        const arr: { address: string; decimals: number }[] = [];
        for (const farm of farms) {
            set.add(farm.lp_address);
        }
        // for (const farm of farms) {
        //     if (farm.token_type === FarmType.advanced)
        //         arr.push({ address: utils.getAddress(farm.lp_address), decimals: farm.decimals });
        // }
        set.forEach((address) => {
            const farm = farms.find((farm) => farm.lp_address === address);
            if (farm) {
                arr.push({ address, decimals: farm.decimals });
            }
        });
        return arr;
    }, [farms]);

    const { prices, isLoading: isLoadingPrices } = usePriceOfTokens();

    const { formattedBalances, isLoading: isLoadingBalances } = useBalances();

    useEffect(() => {
        const tokens: Token[] = tokenAddresses.map(({ address, decimals }) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address);
            const isToken1 = farm?.token1 === address;
            let obj: Token = {
                address: address,
                decimals: decimals,
                token_type: FarmType.normal,
                balance: formattedBalances[address]
                    ? formattedBalances[address]! < 1 / 10 ** tokenBalDecimalPlaces
                        ? noExponents(formattedBalances[address]!.toPrecision(2)).slice(0, -1)
                        : toFixedFloor(formattedBalances[address]!, tokenBalDecimalPlaces).toString()
                    : "0",
                usdBalance: formattedBalances[address]
                    ? prices[address] * formattedBalances[address]! < 1 / 10 ** usdBalDecimalPlaces
                        ? noExponents((prices[address] * formattedBalances[address]!).toPrecision(2)).slice(0, -1)
                        : toFixedFloor(prices[address] * formattedBalances[address]!, usdBalDecimalPlaces).toString()
                    : "0",
                logo: isToken1 ? farm?.logo1 : farm?.logo2 || "",
                name: isToken1 ? farm?.name1 : farm?.name2 || "",
            };
            return obj;
        });

        const lpTokens: Token[] = lpAddresses.map(({ address, decimals }) => {
            const farm = farms.find((farm) => utils.getAddress(farm.lp_address) === address);
            let obj: Token = {
                address: address,
                decimals: decimals,
                token_type: FarmType.advanced,
                balance: formattedBalances[address]
                    ? formattedBalances[address]! < 1 / 10 ** tokenBalDecimalPlaces
                        ? noExponents(formattedBalances[address]!.toPrecision(2)).slice(0, -1)
                        : toFixedFloor(formattedBalances[address]!, tokenBalDecimalPlaces).toString()
                    : "0",
                usdBalance: formattedBalances[address]
                    ? prices[address] * formattedBalances[address]! < 1 / 10 ** usdBalDecimalPlaces
                        ? noExponents((prices[address] * formattedBalances[address]!).toPrecision(2)).slice(0, -1)
                        : toFixedFloor(prices[address] * formattedBalances[address]!, usdBalDecimalPlaces).toString()
                    : "0",
                name: farm?.url_name!,
                logo: farm?.logo1!,
                logo2: farm?.logo2,
            };
            return obj;
        });

        const ethToken: Token = {
            address: ethAddress,
            token_type: FarmType.normal,
            balance:
                ethBalance < 1 / 10 ** tokenBalDecimalPlaces
                    ? noExponents(ethBalance.toPrecision(2)).slice(0, -1)
                    : toFixedFloor(ethBalance, tokenBalDecimalPlaces).toString(),
            decimals: 18,
            logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024",
            name: "ETH",
            network: networkId === 1 ? "Mainnet" : "Arbitrum",
            usdBalance:
                ethBalance * prices[ethAddress] < 1 / 10 ** usdBalDecimalPlaces
                    ? noExponents((ethBalance * prices[ethAddress]).toPrecision(2)).slice(0, -1)
                    : toFixedFloor(ethBalance * prices[ethAddress], usdBalDecimalPlaces).toString(),
        };

        tokens.unshift(ethToken);
        setTokens(tokens);
        setLpTokens(lpTokens);
    }, [farms, prices, tokenAddresses, lpAddresses, ethBalance, networkId, formattedBalances]);

    return { tokens, lpTokens, isLoading: isLoadingBalances || isLoadingPrices };
};
