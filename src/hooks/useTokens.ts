import { useState, useEffect, useMemo } from "react";
import { Token } from "src/types";
import { getNativeCoinInfo, noExponents, toFixedFloor } from "src/utils/common";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import { CHAIN_ID, FarmType } from "src/types/enums";
import { useDecimals } from "./useDecimals";
import { defaultChainId } from "src/config/constants";
import arbTokens from "src/config/constants/tokens";
import { Address, getAddress, zeroAddress } from "viem";

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
    const { currentWallet, getPublicClient } = useWallet();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [lpTokens, setLpTokens] = useState<Token[]>([]);
    const { decimals } = useDecimals();

    const tokenAddresses = useMemo(() => {
        const set = new Set<Address>();
        const arr: { address: Address; decimals: number }[] = [];
        for (const farm of farms) {
            set.add(farm.token1);
            if (farm.token2) set.add(farm.token2);
        }
        set.forEach((address) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address);
            if (farm) {
                const decimal = decimals[farm.chainId][address] || 18;
                arr.push({ address: address as Address, decimals: decimal });
            }
        });
        return arr;
    }, [farms]);

    const lpAddresses = useMemo(() => {
        const set = new Set<string>();

        const arr: { address: Address; decimals: number }[] = [];
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
                arr.push({ address: address as Address, decimals: farm.decimals });
            }
        });
        return arr;
    }, [farms]);

    const { prices, isLoading: isLoadingPrices } = usePriceOfTokens();

    const { formattedBalances, isLoading: isLoadingBalances } = useBalances();

    useEffect(() => {
        const tokens: Token[] = tokenAddresses.map(({ address, decimals }) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address)!;
            const isToken1 = farm?.token1 === address;
            let obj: Token = {
                address: address,
                decimals: decimals,
                token_type: FarmType.normal,
                balance: formattedBalances[farm.chainId][address]
                    ? formattedBalances[farm.chainId][address]! < 1 / 10 ** tokenBalDecimalPlaces
                        ? noExponents(formattedBalances[farm.chainId][address]!.toPrecision(2)).slice(0, -1)
                        : toFixedFloor(formattedBalances[farm.chainId][address]!, tokenBalDecimalPlaces).toString()
                    : "0",
                usdBalance: formattedBalances[farm.chainId][address]
                    ? prices[farm.chainId][address] * formattedBalances[farm.chainId][address]! <
                      1 / 10 ** usdBalDecimalPlaces
                        ? noExponents(
                              (prices[farm.chainId][address] * formattedBalances[farm.chainId][address]!).toPrecision(2)
                          ).slice(0, -1)
                        : toFixedFloor(
                              prices[farm.chainId][address] * formattedBalances[farm.chainId][address]!,
                              usdBalDecimalPlaces
                          ).toString()
                    : "0",
                logo: isToken1 ? farm?.logo1 : farm?.logo2 || "",
                name: isToken1 ? farm?.name1 : farm?.name2 || "",
                price: prices[farm.chainId][address],
                networkId: farm.chainId,
            };
            return obj;
        });

        arbTokens.forEach((token) => {
            let obj: Token = {
                address: token.address,
                decimals: token.decimals,
                token_type: FarmType.normal,
                balance: formattedBalances[token.chainId][token.address]
                    ? formattedBalances[token.chainId][token.address]! < 1 / 10 ** tokenBalDecimalPlaces
                        ? noExponents(formattedBalances[token.chainId][token.address]!.toPrecision(2)).slice(0, -1)
                        : toFixedFloor(
                              formattedBalances[token.chainId][token.address]!,
                              tokenBalDecimalPlaces
                          ).toString()
                    : "0",
                usdBalance: formattedBalances[token.chainId][token.address]
                    ? prices[token.chainId][token.address] * formattedBalances[token.chainId][token.address]! <
                      1 / 10 ** usdBalDecimalPlaces
                        ? noExponents(
                              (
                                  prices[token.chainId][token.address] *
                                  formattedBalances[token.chainId][token.address]!
                              ).toPrecision(2)
                          ).slice(0, -1)
                        : toFixedFloor(
                              prices[token.chainId][token.address] * formattedBalances[token.chainId][token.address]!,
                              usdBalDecimalPlaces
                          ).toString()
                    : "0",
                name: token.name,
                logo: token.logo,
                price: prices[token.chainId][token.address],
                networkId: token.chainId,
            };
            tokens.push(obj);
        });

        const lpTokens: Token[] = lpAddresses.map(({ address, decimals }) => {
            const farm = farms.find((farm) => getAddress(farm.lp_address) === address)!;
            let obj: Token = {
                address: address,
                decimals: decimals,
                token_type: FarmType.advanced,
                balance: formattedBalances[farm.chainId][address]
                    ? formattedBalances[farm.chainId][address]! < 1 / 10 ** tokenBalDecimalPlaces
                        ? noExponents(formattedBalances[farm.chainId][address]!.toPrecision(2)).slice(0, -1)
                        : toFixedFloor(formattedBalances[farm.chainId][address]!, tokenBalDecimalPlaces).toString()
                    : "0",
                usdBalance: formattedBalances[farm.chainId][address]
                    ? prices[farm.chainId][address] * formattedBalances[farm.chainId][address]! <
                      1 / 10 ** usdBalDecimalPlaces
                        ? noExponents(
                              (prices[farm.chainId][address] * formattedBalances[farm.chainId][address]!).toPrecision(2)
                          ).slice(0, -1)
                        : toFixedFloor(
                              prices[farm.chainId][address] * formattedBalances[farm.chainId][address]!,
                              usdBalDecimalPlaces
                          ).toString()
                    : "0",
                name: farm?.url_name!,
                logo: farm?.logo1!,
                logo2: farm?.logo2,
                price: prices[farm.chainId][address],
                networkId: defaultChainId,
            };
            return obj;
        });
        const traxAddr = arbTokens.find((item) => item.name === "xTrax")?.address!;
        const traxToken: Token = {
            address: arbTokens.find((item) => item.name === "xTrax")?.address!,
            logo: arbTokens.find((item) => item.name === "xTrax")?.logo!,
            decimals: 18,
            balance: formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]
                ? formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]! < 1 / 10 ** tokenBalDecimalPlaces
                    ? noExponents(formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]!.toPrecision(2)).slice(0, -1)
                    : toFixedFloor(formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]!, tokenBalDecimalPlaces).toString()
                : "0",
            usdBalance: formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]
                ? formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]! < 1 / 10 ** tokenBalDecimalPlaces
                    ? noExponents(formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]!.toPrecision(2)).slice(0, -1)
                    : toFixedFloor(formattedBalances[CHAIN_ID.ARBITRUM][traxAddr]!, tokenBalDecimalPlaces).toString()
                : "0",
            name: "xTrax",
            price: 0,
            networkId: defaultChainId,
            token_type: FarmType.normal,
        };

        // Native coins for each chain
        Object.entries(formattedBalances).map(([chainId, value]) => {
            const networkId = Number(chainId);
            const bal = value[zeroAddress];
            const token: Token = {
                address: zeroAddress,
                logo: getNativeCoinInfo(networkId).logo,
                decimals: 18,
                balance: formattedBalances[networkId][zeroAddress]
                    ? formattedBalances[networkId][zeroAddress]! < 1 / 10 ** tokenBalDecimalPlaces
                        ? noExponents(formattedBalances[networkId][zeroAddress]!.toPrecision(2)).slice(0, -1)
                        : toFixedFloor(formattedBalances[networkId][zeroAddress]!, tokenBalDecimalPlaces).toString()
                    : "0",
                usdBalance: formattedBalances[networkId][zeroAddress]
                    ? prices[networkId][zeroAddress] * formattedBalances[networkId][zeroAddress]! < 1 / 10 ** 3
                        ? noExponents(
                              (prices[networkId][zeroAddress] * formattedBalances[networkId][zeroAddress]!).toPrecision(
                                  3
                              )
                          ).slice(0, -1)
                        : toFixedFloor(
                              prices[networkId][zeroAddress] * formattedBalances[networkId][zeroAddress]!,
                              3
                          ).toString()
                    : "0",
                name: getNativeCoinInfo(networkId).name,
                price: prices[networkId][zeroAddress],
                networkId: networkId,
                token_type: FarmType.normal,
            };
            tokens.unshift(token);
        });
        tokens.unshift(traxToken);

        setTokens(tokens);
        setLpTokens(lpTokens);
    }, [farms, prices, tokenAddresses, lpAddresses, formattedBalances]);

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
