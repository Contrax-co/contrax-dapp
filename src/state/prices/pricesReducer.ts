import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { AddPrice, GetOldPricesActionPayload, OldPrices, StateInterface } from "./types";
import { utils } from "ethers";
import { getPricesByTime, getTokenPricesBackend } from "src/api/token";
import { defaultChainId } from "src/config/constants";
import { Address } from "viem";
import { CHAIN_ID } from "src/types/enums";
import { Common_Chains_State } from "src/config/constants/pools_json";

const initialState: StateInterface = {
    prices: Common_Chains_State,
    isLoading: false,
    isFetched: false,
    oldPrices: {},
    isFetchingOldPrices: false,
    isLoadedOldPrices: false,
};

export const updatePrices = createAsyncThunk("prices/updatePrices", async (_, thunkApi) => {
    try {
        const data = await getTokenPricesBackend();
        return data;
    } catch (error) {
        console.log("Price unable to fetch", defaultChainId);
        console.error(error);
    }
});

export const getPricesOfLpByTimestamp = createAsyncThunk(
    "prices/getOldPrices",
    async ({ lpData, farms }: GetOldPricesActionPayload, thunkApi) => {
        // ----------------- Find Lp Addresses of given lpData -----------------
        const lps = lpData
            .map((lp) => ({
                ...lp,
                address: farms.find((farm) => farm.id === Number(lp.tokenId))?.vault_addr!,
                chainId: farms.find((farm) => farm.id === Number(lp.tokenId))?.chainId!,
            }))
            .filter((item) => !!item.chainId);

        const res = await getPricesByTime(
            lps.map((item) => ({
                address: item.address,
                chainId: item.chainId,
                timestamp: Number(item.blockTimestamp),
            }))
        );
        return res;
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
        builder.addCase(getPricesOfLpByTimestamp.fulfilled, (state, action) => {
            state.isFetchingOldPrices = false;
            state.isLoadedOldPrices = true;
            Object.entries(action.payload!).forEach(([chainId, data]) => {
                if (!state.oldPrices[chainId]) state.oldPrices[chainId] = {};
                Object.entries(data).forEach(([tokenAddress, prices]) => {
                    if (!state.oldPrices[chainId][tokenAddress]) state.oldPrices[chainId][tokenAddress] = [];
                    // #region remove duplicates
                    const uniqueMap = new Map();
                    // Iterate through each item in the array
                    state.oldPrices[chainId][tokenAddress].concat(prices).forEach((item) => {
                        if (!uniqueMap.has(item.timestamp)) {
                            uniqueMap.set(item.timestamp, item);
                        }
                    });
                    // Convert the map back to an array
                    state.oldPrices[chainId][tokenAddress] = Array.from(uniqueMap.values());
                    // #endregion remove duplicates
                });
            });
            state.oldPrices = action.payload!;
        });
        builder.addCase(getPricesOfLpByTimestamp.rejected, (state) => {
            state.isFetchingOldPrices = false;
        });
    },
});

export const { addPrice, setOldPrices } = pricesSlice.actions;

export default pricesSlice.reducer;
