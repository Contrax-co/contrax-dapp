import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { AddPrice, GetOldPricesActionPayload, OldPrices, StateInterface, UpdatePricesActionPayload } from "./types";
import { Contract, utils, constants, BigNumber } from "ethers";
import { getNetworkName } from "src/utils/common";
import { getPriceByTime, getPricesByTime } from "src/api/token";
import { incrementErrorCount, resetErrorCount } from "../error/errorReducer";
import { defaultChainId } from "src/config/constants";

const initialState: StateInterface = { prices: {}, isLoading: false, isFetched: false, oldPrices: {} };

const lpAbi = [
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function getReserves() view returns (uint112,uint112,uint32)",
];

const additionalTokens = [
    constants.AddressZero,
    "0x5979d7b546e38e414f7e9822514be443a4800529",
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    "0x4d15a3a2286d883af0aa1b3f21367843fac63e07",
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    "0x641441c631e2f909700d2f41fd87f0aa6a6b4edb",
];

export const updatePrices = createAsyncThunk(
    "prices/updatePrices",
    async ({ chainId, farms, multicallProvider }: UpdatePricesActionPayload, thunkApi) => {
        try {
            if (chainId !== defaultChainId) return;
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
            let addresses = Array.from(set);

            //------------------->> 1. Get prices from coinsLama
            const apiUrl = coinsLamaPriceByChainId[chainId] + addresses.join(`,${getNetworkName(chainId)}:`);
            const res = await axios.get(apiUrl);

            const coins = JSON.parse(JSON.stringify(res.data)).coins;

            Object.entries(coins).forEach(([key, value]) => {
                // @ts-ignore
                prices[key.split(":")[1].toLowerCase()] = value.price;
            });

            //------------------->> 2. Get prices from blockchain
            const remaining = addresses.filter((address) => !Object.keys(prices).includes(address));
            const lpContracts = remaining.map((address) => new Contract(address, lpAbi, multicallProvider));
            const lpCalls: any[] = [];
            lpContracts.forEach((contract) => {
                lpCalls.push(contract.token0());
                lpCalls.push(contract.token1());
                lpCalls.push(contract.totalSupply());
                lpCalls.push(contract.getReserves());
            });
            const lpResults = await Promise.all(lpCalls);
            const lpInfo: { [key: string]: any } = {};

            // Getting Decimals for tokens of LPs
            const tokensForDecimalsAddresses = new Set<string>();
            for (let i = 0; i < lpResults.length; i += 4) {
                const token0 = lpResults[i].toLowerCase();
                const token1 = lpResults[i + 1].toLowerCase();
                const totalSupply = lpResults[i + 2];
                const reserves = lpResults[i + 3];
                tokensForDecimalsAddresses.add(token0);
                tokensForDecimalsAddresses.add(token1);
                lpInfo[remaining[Number((i / 4).toFixed())]] = {
                    token0,
                    token1,
                    totalSupply,
                    reserves,
                };
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
                const token1USDLiquidity = value.reserves[1]
                    .mul(parseInt(String(prices[value.token1] * 1000)))
                    .div(1000)
                    .div(utils.parseUnits("1", token1Decimals));
                let totalUSDLiquidity = utils.parseEther("0");
                if (token0USDLiquidity.gt(0) && token1USDLiquidity.gt(0)) {
                    totalUSDLiquidity = token0USDLiquidity.add(token1USDLiquidity);
                } else {
                    if (token0USDLiquidity !== 0) {
                        totalUSDLiquidity = token0USDLiquidity.mul(2);
                    } else if (token1USDLiquidity !== 0) {
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

            //------------------->> 4. Set Stable coin prices
            // prices[addressesByChainId[chainId].usdcAddress] = 1;

            //------------------->> 5. Set prices for tokens in state

            // create address checksum
            const checksummed: { [key: string]: number } = {};
            Object.entries(prices).forEach(([key, value]) => {
                checksummed[utils.getAddress(key)] = value;
            });
            thunkApi.dispatch(resetErrorCount());
            return checksummed;
        } catch (error) {
            console.error(error);
            if (chainId !== defaultChainId) {
                thunkApi.dispatch(incrementErrorCount());
            }
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
    },
});

export const { addPrice, setOldPrices } = pricesSlice.actions;

export default pricesSlice.reducer;
