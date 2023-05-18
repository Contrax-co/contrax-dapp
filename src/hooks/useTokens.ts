import { useState, useEffect, useMemo } from "react";
import { Token } from "src/types";
import { noExponents, toFixedFloor } from "src/utils/common";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import { constants, utils } from "ethers";
import { CHAIN_ID, FarmType } from "src/types/enums";
import { useDecimals } from "./useDecimals";

const ethAddress = constants.AddressZero;
const tokenBalDecimalPlaces = 3;
const usdBalDecimalPlaces = 2;

export enum UIStateEnum {
    "SHOW_TOKENS" = "SHOW_TOKENS",
    "SHOW_TOKENS_LP" = "SHOW_TOKENS_LP",
    "SHOW_TOKENS_TOKENS" = "SHOW_TOKENS_TOKENS",
    "LOADING" = "LOADING",
    "NO_TOKENS" = "NO_TOKENS",
    "CONNECT_WALLET" = "CONNECT_WALLET",
}

export const useTokens = () => {
    const { farms } = useFarms();
    const {
        balance: ethBalance,
        networkId,
        currentWallet,
        mainnetBalance,
        polygonBalance,
        arbitrumBalance,
    } = useWallet();
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
            if (farm.name !== "GMX") set.add(farm.lp_address);
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

        // const ethToken: Token = {
        //     address: ethAddress,
        //     token_type: FarmType.normal,
        //     balance:
        //         ethBalance < 1 / 10 ** tokenBalDecimalPlaces
        //             ? noExponents(ethBalance.toPrecision(2)).slice(0, -1)
        //             : toFixedFloor(ethBalance, tokenBalDecimalPlaces).toString(),
        //     decimals: 18,
        //     logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024",
        //     name: "ETH",
        //     network: networkId === 1 ? "Mainnet" : "Arbitrum",
        //     usdBalance:
        //         ethBalance * prices[ethAddress] < 1 / 10 ** usdBalDecimalPlaces
        //             ? noExponents((ethBalance * prices[ethAddress]).toPrecision(2)).slice(0, -1)
        //             : toFixedFloor(ethBalance * prices[ethAddress], usdBalDecimalPlaces).toString(),
        // };
        const matic: Token = {
            address: ethAddress,
            token_type: FarmType.normal,
            balance:
                Number(polygonBalance?.formatted) < 1
                    ? noExponents(Number(polygonBalance?.formatted).toPrecision(2)).slice(0, -1)
                    : toFixedFloor(Number(polygonBalance?.formatted), tokenBalDecimalPlaces).toString(),
            decimals: 18,
            logo: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025",
            name: "MATIC",
            network: "Polygon",
            usdBalance:
                (polygonBalance?.usdAmount &&
                    (polygonBalance.usdAmount < 1
                        ? noExponents((polygonBalance?.usdAmount).toPrecision(2)).slice(0, -1)
                        : toFixedFloor(polygonBalance?.usdAmount, usdBalDecimalPlaces).toString())) ||
                "0",
        };

        const ethMainnet: Token = {
            address: ethAddress,
            token_type: FarmType.normal,
            balance:
                Number(mainnetBalance?.formatted) < 1
                    ? noExponents(Number(mainnetBalance?.formatted).toPrecision(2)).slice(0, -1)
                    : toFixedFloor(Number(mainnetBalance?.formatted), tokenBalDecimalPlaces).toString(),
            decimals: 18,
            logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024",
            name: "ETH",
            network: "Mainnet",
            usdBalance:
                (mainnetBalance?.usdAmount &&
                    (mainnetBalance.usdAmount < 1
                        ? noExponents((mainnetBalance?.usdAmount).toPrecision(2)).slice(0, -1)
                        : toFixedFloor(mainnetBalance?.usdAmount, usdBalDecimalPlaces).toString())) ||
                "0",
        };
        const arbBalance: Token = {
            address: ethAddress,
            token_type: FarmType.normal,
            balance:
                Number(arbitrumBalance?.formatted) < 1
                    ? noExponents(Number(arbitrumBalance?.formatted).toPrecision(2)).slice(0, -1)
                    : toFixedFloor(Number(arbitrumBalance?.formatted), tokenBalDecimalPlaces).toString(),
            decimals: 18,
            logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024",
            name: "ETH",
            network: "Arbitrum",
            usdBalance:
                (arbitrumBalance?.usdAmount &&
                    (arbitrumBalance.usdAmount < 1
                        ? noExponents((arbitrumBalance?.usdAmount).toPrecision(2)).slice(0, -1)
                        : toFixedFloor(arbitrumBalance?.usdAmount, usdBalDecimalPlaces).toString())) ||
                "0",
        };
        if (Number(arbBalance.usdBalance) >= 0.5 && networkId === CHAIN_ID.ARBITRUM) tokens.unshift(arbBalance);
        if (Number(matic.usdBalance) >= 0.5 && networkId === CHAIN_ID.POLYGON) tokens.unshift(matic);
        if (Number(ethMainnet.usdBalance) >= 0.5 && networkId === CHAIN_ID.MAINNET) tokens.unshift(ethMainnet);
        setTokens(tokens);
        setLpTokens(lpTokens);
    }, [
        farms,
        prices,
        tokenAddresses,
        lpAddresses,
        ethBalance,
        networkId,
        formattedBalances,
        polygonBalance,
        mainnetBalance,
    ]);

    const UIState = useMemo(() => {
        let STATE: UIStateEnum = UIStateEnum.CONNECT_WALLET;
        const isLoading = isLoadingBalances || isLoadingPrices;
        const hasTokens = tokens?.some((token) => Number(token.usdBalance) > 0.01);
        const hasLpTokens = lpTokens?.some((token) => Number(token.usdBalance) > 0.01);
        if (hasTokens || hasLpTokens) {
            STATE = UIStateEnum.SHOW_TOKENS;
            if (!hasTokens) STATE = UIStateEnum.SHOW_TOKENS_LP;
            if (!hasLpTokens) STATE = UIStateEnum.SHOW_TOKENS_TOKENS;
        } else {
            if (currentWallet) {
                if (isLoading) {
                    STATE = UIStateEnum.LOADING;
                } else {
                    STATE = UIStateEnum.NO_TOKENS;
                }
            } else {
                STATE = UIStateEnum.CONNECT_WALLET;
            }
        }
        return STATE;
    }, [tokens, lpTokens, isLoadingBalances, isLoadingPrices, currentWallet]);

    return { tokens, lpTokens, isLoading: isLoadingBalances || isLoadingPrices, UIState };
};
