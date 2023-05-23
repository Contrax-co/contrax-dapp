import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getApy } from "src/api/apy";
import { AddApyAction, AddApysAction, Apys, FetchApysThunk, StateInterface } from "./types";
import poolsJson from "src/config/constants/pools.json";

const apyObj: { [farmId: number]: Apys } = {};
poolsJson.forEach((pool) => {
    apyObj[pool.id] = {
        apy: 0,
        compounding: 0,
        feeApr: 0,
        rewardsApr: 0,
    };
});

const initialState: StateInterface = { apys: apyObj, isLoading: false, isFetched: false };

export const fetchApys = createAsyncThunk(
    "apys/fetchApys",
    async ({ farms, chainId, multicallProvider }: FetchApysThunk, thunkApi) => {
        const promises = farms.map((farm) => getApy(farm, chainId, multicallProvider));
        const res = await Promise.all(promises);
        const obj: { [farmId: number]: Apys } = {};
        res.forEach((apy, index) => {
            obj[farms[index].id] = apy;
        });
        return obj;
    }
);

const apysSlice = createSlice({
    name: "apys",
    initialState: initialState,
    reducers: {
        addApy: (state, action: PayloadAction<AddApyAction>) => {
            state.apys[action.payload.farmId] = action.payload.data;
        },
        addApys: (state, action: PayloadAction<AddApysAction>) => {
            state.apys = action.payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(fetchApys.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchApys.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.apys = { ...action.payload };
        });
        builder.addCase(fetchApys.rejected, (state) => {
            state.isLoading = false;
            state.isFetched = false;
            state.apys = apyObj;
        });
    },
});

export const { addApy, addApys } = apysSlice.actions;

export default apysSlice.reducer;
