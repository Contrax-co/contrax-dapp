import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { AddPrice, GetOldPricesActionPayload, OldPrices, StateInterface } from "./types";
import { utils } from "ethers";
import { getTokenPricesBackend } from "src/api/token";
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
        let prices: { [key: string]: { timestamp: number; price: number }[] } = {};
        // ----------------- Find Lp Addresses of given lpData -----------------
        const lps = lpData.map((lp) => ({
            ...lp,
            address: farms.find((farm) => farm.id === Number(lp.tokenId))!.vault_addr,
        }));

        // ----------------- Get prices from api, save remaining lps whose prices not available -----------------
        const remainingLps = (await Promise.all(lps.map((lp) => getTokenPricesBackend(Number(lp.blockTimestamp), 50))))
            .map((res, index) => {
                if (res) {
                    prices[utils.getAddress(lps[index].address)] = [
                        {
                            price: res[String(CHAIN_ID.ARBITRUM)][utils.getAddress(lps[index].address) as Address],
                            timestamp: Number(lps[index].blockTimestamp),
                        },
                    ];
                    return undefined;
                }
                return { ...lps[index] };
            })
            .filter((lp) => !!lp);
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
