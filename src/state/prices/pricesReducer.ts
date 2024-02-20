import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { AddPrice, GetOldPricesActionPayload, OldPrices, StateInterface, UpdatePricesActionPayload } from "./types";
import { Contract, utils, constants, BigNumber } from "ethers";
import { getNetworkName, toEth } from "src/utils/common";
import { getPriceByTime, getPricesByTime, getTokenPricesBackend } from "src/api/token";
import { defaultChainId } from "src/config/constants";
import { addressesByChainId } from "src/config/constants/contracts";
import tokens from "src/config/constants/tokens";

const initialState: StateInterface = {
    prices: {},
    isLoading: false,
    isFetched: false,
    oldPrices: {},
    isFetchingOldPrices: false,
    isLoadedOldPrices: false,
};

const lpAbi = [
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function getReserves() view returns (uint112,uint112,uint32)",
    "function swap() view returns (address)",
];

const additionalTokens = [
    constants.AddressZero,
    "0x5979d7b546e38e414f7e9822514be443a4800529",
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    "0x4d15a3a2286d883af0aa1b3f21367843fac63e07",
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    "0x641441c631e2f909700d2f41fd87f0aa6a6b4edb",
    "0x32Eb7902D4134bf98A28b963D26de779AF92A212",
];

export const updatePrices = createAsyncThunk(
    "prices/updatePrices",
    async ({ chainId, farms, multicallProvider }: UpdatePricesActionPayload, thunkApi) => {
        try {
            if (chainId !== defaultChainId) return;
            return await getTokenPricesBackend();
            // #region Get Prices manually

            //----------------- Get Addresses -----------------
            let prices: { [key: string]: number } = {};
            const set = farms.reduce((acc, farm) => {
                acc.add(farm.token1.toLowerCase());
                if (farm.id === 6 || farm.id === 7 || farm.id === 9) return acc;
                if (farm.token2) acc.add(farm.token2.toLowerCase());
                acc.add(farm.lp_address.toLowerCase());
                return acc;
            }, new Set<string>());
            additionalTokens.forEach((token) => set.add(token.toLowerCase()));
            tokens.forEach((token) => {
                if (token.chainId === defaultChainId && token.name !== "xTrax") set.add(token.address.toLowerCase());
            });
            let addresses = Array.from(set);

            //------------------->> 1. Get prices from coinsLama
            const apiUrl =
                coinsLamaPriceByChainId[chainId] + addresses.join(`,${getNetworkName(chainId)}:`) + "?searchWidth=100h";
            const res = await axios.get(apiUrl);

            const coins = JSON.parse(JSON.stringify(res.data)).coins;

            Object.entries(coins).forEach(([key, value]) => {
                // @ts-ignore
                prices[key.split(":")[1].toLowerCase()] = value.price;
            });

            //------------------->> 2. Get prices from blockchain
            const remaining = addresses.filter((address) => !Object.keys(prices).includes(address));
            const lpContracts = remaining.map((address) => new Contract(address, lpAbi, multicallProvider));
            let lpCalls: any[] = [];
            // lpContracts.forEach((contract) => {
            //     lpCalls.push(contract.totalSupply());
            //     lpCalls.push(contract.swap());
            // });
            lpContracts.forEach((contract) => {
                lpCalls.push(contract.token0());
                lpCalls.push(contract.token1());
                lpCalls.push(contract.totalSupply());
                lpCalls.push(contract.getReserves());
            });
            let lpResults = await Promise.all(lpCalls);
            lpCalls = [];
            // for (let i = 0; i < lpResults.length; i += 2) {
            //     const swapAddress = lpResults[i + 1];
            //     const swapContract = new Contract(
            //         swapAddress,
            //         [
            //             "function getToken(uint8) view returns (address)",
            //             "function getTokenBalance(uint8) view returns (uint256)",
            //             "function getVirtualPrice() view returns (uint256)",
            //         ],
            //         multicallProvider
            //     );
            //     lpCalls.push(swapContract.getToken(0));
            //     lpCalls.push(swapContract.getToken(1));
            //     lpCalls.push(swapContract.getTokenBalance(0));
            //     lpCalls.push(swapContract.getTokenBalance(1));
            //     lpCalls.push(swapContract.getVirtualPrice());
            // }
            // const lpResults2 = await Promise.all(lpCalls);
            const lpInfo: {
                [key: string]: {
                    token0: string;
                    token1: string;
                    totalSupply: BigNumber;
                    reserves: [BigNumber, BigNumber];
                    [key: string]: any;
                };
            } = {};

            // Getting Decimals for tokens of LPs
            // let j = 0;
            const tokensForDecimalsAddresses = new Set<string>();
            for (let i = 0; i < lpResults.length; i += 4) {
                const token0 = lpResults[i].toLowerCase();
                const token1 = lpResults[i + 1].toLowerCase();
                const totalSupply = lpResults[i + 2];
                const reserves = lpResults[i + 3];
                // const priceOfToken1PerToken0 = 1 / Number(toEth(lpResults2[i + 4]));
                tokensForDecimalsAddresses.add(token0);
                tokensForDecimalsAddresses.add(token1);
                lpInfo[remaining[Number((i / 4).toFixed())]] = {
                    token0,
                    token1,
                    totalSupply,
                    reserves,
                    // priceOfToken1PerToken0,
                };
                // j += 2;
            }
            const tokensContracts = Array.from(tokensForDecimalsAddresses).map(
                (address) => new Contract(address, ["function decimals() view returns (uint256)"], multicallProvider)
            );
            const tokensCalls: any[] = [];
            tokensContracts.forEach((contract) => {
                tokensCalls.push(contract.decimals());
            });
            const tokensResults = await Promise.all(tokensCalls);
            const tokensDecimals: { [key: string]: number } = {};
            for (let i = 0; i < tokensResults.length; i++) {
                tokensDecimals[Array.from(tokensForDecimalsAddresses)[i]] = tokensResults[i].toNumber();
            }
            ///////////////////////////////////////////////
            //------------------->> 3. Calculate prices for LPs
            Object.entries(lpInfo).forEach(([key, value]) => {
                const token0Decimals = tokensDecimals[value.token0];
                const token1Decimals = tokensDecimals[value.token1];
                const token0USDLiquidity = value.reserves[0]
                    .mul(parseInt(String(prices[value.token0] * 1000)))
                    .div(1000)
                    .div(utils.parseUnits("1", token0Decimals));

                // we know token 0 price
                // we can get virtual price in wei which we convert to eth
                // 1 / virtual price is the price of token1 in terms of token 0 eg.0.997
                // token1 Price = token0Price * 1/virtualPrice
                // const token1Price = prices[value.token0] * value.priceOfToken1PerToken0;
                // prices[value.token1] = token1Price;

                const token1USDLiquidity = value.reserves[1]
                    .mul(parseInt(String(prices[value.token1] * 1000)))
                    .div(1000)
                    .div(utils.parseUnits("1", token1Decimals));
                let totalUSDLiquidity = utils.parseEther("0");
                if (token0USDLiquidity.gt(0) && token1USDLiquidity.gt(0)) {
                    totalUSDLiquidity = token0USDLiquidity.add(token1USDLiquidity);
                } else {
                    if (!token0USDLiquidity.isZero()) {
                        totalUSDLiquidity = token0USDLiquidity.mul(2);
                    } else if (!token1USDLiquidity.isZero()) {
                        totalUSDLiquidity = token1USDLiquidity.mul(2);
                    }
                }
                const price = Number(totalUSDLiquidity.toNumber() / Number(utils.formatEther(value.totalSupply)));

                lpInfo[key] = {
                    ...value,
                    token0Decimals,
                    token1Decimals,
                    token0USDLiquidity,
                    token1USDLiquidity,
                    totalUSDLiquidity,
                    price,
                };
                prices[key.toLowerCase()] = price;
            });

            //------------------->> 3.5. Set Hop token prices
            // #region Hop Prices Calculation
            const hopFarms = farms.filter((item) => item.platform === "Hop");
            const hopSwapContractsAddresses = await Promise.all(
                hopFarms.map((item) => new Contract(item.lp_address, item.lp_abi, multicallProvider).swap())
            );

            const hopSwapAbi = [
                "function getVirtualPrice() view returns (uint256)",
                "function getTokenBalance(uint8) view returns (uint256)",
                "function getToken(uint8) view returns (address)",
            ];
            let hopCalls: any[] = [];

            hopSwapContractsAddresses.forEach((item, i) => {
                const contract = new Contract(item, hopSwapAbi, multicallProvider);
                hopCalls.push(contract.getToken(0));
                hopCalls.push(contract.getToken(1));
                hopCalls.push(contract.getTokenBalance(0));
                hopCalls.push(contract.getTokenBalance(1));
                hopCalls.push(contract.getVirtualPrice());
                hopCalls.push(
                    new Contract(
                        hopFarms[i].lp_address,
                        ["function totalSupply() view returns (uint256)"],
                        multicallProvider
                    ).totalSupply()
                );
            });
            let hopResults = await Promise.all(hopCalls);
            const hopLpInfo: {
                token0: string;
                token1: string;
                totalSupply: string;
                token0Balance: string;
                token1Balance: string;
                virtualPrice: string;
                token0Price: number;
                token1Price: number;
                token0Decimal: number;
                token1Decimal: number;
                lpPrice: number;
            }[] = [];
            let hopDecimalsCalls: any[] = [];
            for (let i = 0; i < hopResults.length; i += 6) {
                const token0 = hopResults[i].toLowerCase();
                const token1 = hopResults[i + 1].toLowerCase();
                const token0Balance = hopResults[i + 2].toString();
                const token1Balance = hopResults[i + 3].toString();
                const virtualPrice = hopResults[i + 4].toString();
                const totalSupply = hopResults[i + 5].toString();
                const token0Price = prices[token0];
                const token1Price = Number(toEth(virtualPrice)) * Number(token0Price);
                hopDecimalsCalls.push(
                    new Contract(token0, ["function decimals() view returns (uint8)"], multicallProvider).decimals()
                );
                hopDecimalsCalls.push(
                    new Contract(token1, ["function decimals() view returns (uint8)"], multicallProvider).decimals()
                );
                // @ts-ignore
                hopLpInfo[i / 6] = {
                    token0,
                    token1,
                    totalSupply,
                    token0Balance,
                    token1Balance,
                    virtualPrice,
                    token0Price,
                    token1Price,
                };
            }
            const hopDecimals = await Promise.all(hopDecimalsCalls);
            for (let i = 0; i < hopDecimals.length; i += 2) {
                // @ts-ignore
                hopLpInfo[i / 2]["token0Decimal"] = hopDecimals[i];
                // @ts-ignore
                hopLpInfo[i / 2]["token1Decimal"] = hopDecimals[i + 1];
            }

            for (let i = 0; i < hopLpInfo.length; i++) {
                const token0Balance =
                    Number(toEth(hopLpInfo[i].token0Balance, hopLpInfo[i].token0Decimal)) * hopLpInfo[i].token0Price;
                const token1Balance =
                    Number(toEth(hopLpInfo[i].token1Balance, hopLpInfo[i].token1Decimal)) * hopLpInfo[i].token1Price;
                const totalSupply = toEth(hopLpInfo[i].totalSupply);
                let lpPrice = (token0Balance + token1Balance) / Number(totalSupply);
                hopLpInfo[i]["lpPrice"] = lpPrice;
                // prices[hopFarms[i].lp_address.toLowerCase()] =
                //     (prices[hopFarms[i].lp_address.toLowerCase()] + lpPrice) / 2;

                prices[hopFarms[i].lp_address.toLowerCase()] = lpPrice;
            }

            console.log("hopLpInfo =>", hopLpInfo);
            // #endregion Hop Prices Calculation

            //------------------->> 4. Set Stable coin prices
            // prices[addressesByChainId[chainId].usdcAddress] = 1;
            // checksummed[addressesByChainId[chainId].nativeUsdAddress!] = 1;

            //------------------->> 4. Adjust Lp prices
            // farms.forEach((farm) => {
            //     switch (farm.name) {
            //         case "ETH":
            //             prices[farm.lp_address.toLowerCase()] *= 0.99;
            //             break;
            //         case "USDC":
            //             prices[farm.lp_address.toLowerCase()] *= 1.12;
            //             break;
            //         case "DAI":
            //             prices[farm.lp_address.toLowerCase()] *= 1.01;
            //             break;
            //         case "WETH-DPX":
            //             prices[farm.lp_address.toLowerCase()] *= 1.15;
            //             break;
            //         case "WETH-SUSHI":
            //             prices[farm.lp_address.toLowerCase()] *= 1.01;
            //             break;
            //         case "WETH-MAGIC":
            //             prices[farm.lp_address.toLowerCase()] *= 1.08;
            //             break;
            //     }
            // });

            //------------------->> 5. Set prices for tokens in state

            // create address checksum
            const checksummed: { [key: string]: number } = {};
            Object.entries(prices).forEach(([key, value]) => {
                checksummed[utils.getAddress(key)] = value;
            });
            console.log("checksummed =>", checksummed);
            return checksummed;
            // #endregion Get Prices manually
        } catch (error) {
            console.log("Price unable to fetch", chainId, defaultChainId);
            console.error(error);
        }
    }
);

export const getPricesOfLpByTimestamp = createAsyncThunk(
    "prices/getOldPrices",
    async ({ lpData, farms, provider, chainId, decimals }: GetOldPricesActionPayload, thunkApi) => {
        let prices: { [key: string]: { timestamp: number; price: number }[] } = {};
        // ----------------- Find Lp Addresses of given lpData -----------------
        const lps = lpData.map((lp) => ({
            ...lp,
            address: farms.find((farm) => farm.id === Number(lp.tokenId))!.lp_address,
        }));

        // ----------------- Get prices from api, save remaining lps whose prices not available -----------------
        const remainingLps = (
            await Promise.all(lps.map((lp) => getPriceByTime(lp.address, Number(lp.blockTimestamp), chainId)))
        )
            .map((res, index) => {
                if (res.price !== 0) {
                    prices[utils.getAddress(lps[index].address)] = [{ ...res }];
                    return undefined;
                }
                return { ...lps[index] };
            })
            .filter((lp) => !!lp);
        // ----------------- Get prices for tokens holded by Lps from api -----------------
        const res = await getPricesByTime(
            remainingLps.reduce((acc, curr) => {
                acc.push({
                    address: curr!.token0,
                    timestamp: Number(curr!.blockTimestamp),
                });
                acc.push({
                    address: curr!.token1,
                    timestamp: Number(curr!.blockTimestamp),
                });
                return acc;
            }, [] as { address: string; timestamp: number }[]),
            chainId
        );

        // ----------------- Set token prices in prices object along with timestamp of price -----------------
        res?.forEach((item) => {
            if (prices[utils.getAddress(item.address)]) {
                prices[utils.getAddress(item.address)].push({
                    price: item.price!,
                    timestamp: item.timestamp,
                });
            } else {
                prices[utils.getAddress(item.address)] = [
                    {
                        price: item.price!,
                        timestamp: item.timestamp,
                    },
                ];
            }
        });

        // ----------------- Calculate price of Lp by given parameters -----------------
        remainingLps.forEach((lp) => {
            if (!lp) return;
            const token0Decimals = decimals[lp.token0];
            const token1Decimals = decimals[lp.token1];
            const token0USDLiquidity = BigNumber.from(lp.reserve0)
                .mul(
                    parseInt(
                        String(
                            prices[utils.getAddress(lp.token0)].find((e) => e.timestamp === Number(lp.blockTimestamp))!
                                .price * 1000
                        )
                    )
                )
                .div(1000)
                .div(utils.parseUnits("1", token0Decimals));
            const token1USDLiquidity = BigNumber.from(lp.reserve1)
                .mul(
                    parseInt(
                        String(
                            prices[utils.getAddress(lp.token1)].find((e) => e.timestamp === Number(lp.blockTimestamp))!
                                .price * 1000
                        )
                    )
                )
                .div(1000)
                .div(utils.parseUnits("1", token1Decimals));
            let totalUSDLiquidity = utils.parseEther("0");
            if (token0USDLiquidity.gt(0) && token1USDLiquidity.gt(0)) {
                totalUSDLiquidity = token0USDLiquidity.add(token1USDLiquidity);
            } else {
                if (!token0USDLiquidity.isZero()) {
                    totalUSDLiquidity = token0USDLiquidity.mul(2);
                } else if (!token1USDLiquidity.isZero()) {
                    totalUSDLiquidity = token1USDLiquidity.mul(2);
                }
            }
            const price = Number(totalUSDLiquidity.toNumber() / Number(utils.formatEther(lp.totalSupply)));

            prices[utils.getAddress(lp.address)] = [{ price, timestamp: Number(lp.blockTimestamp) }];
        });
        thunkApi.dispatch(setOldPrices(prices));
    }
);

const pricesSlice = createSlice({
    name: "prices",
    initialState: initialState,
    reducers: {
        addPrice: (state: StateInterface, action: PayloadAction<AddPrice>) => {
            state.prices = { ...state.prices, ...action.payload };
        },
        setOldPrices: (state, action: PayloadAction<OldPrices>) => {
            state.oldPrices = action.payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(updatePrices.fulfilled, (state, action) => {
            state.prices = { ...action.payload };
            state.isFetched = true;
            state.isLoading = false;
        });
        builder.addCase(updatePrices.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(getPricesOfLpByTimestamp.pending, (state) => {
            state.isFetchingOldPrices = true;
        });
        builder.addCase(getPricesOfLpByTimestamp.fulfilled, (state) => {
            state.isFetchingOldPrices = false;
            state.isLoadedOldPrices = true;
        });
        builder.addCase(getPricesOfLpByTimestamp.rejected, (state) => {
            state.isFetchingOldPrices = false;
        });
    },
});

export const { addPrice, setOldPrices } = pricesSlice.actions;

export default pricesSlice.reducer;
