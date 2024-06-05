import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StateInterface } from "./types";
import { fetchAllFeesPool } from "src/api/fees";

const initialState: StateInterface = {
    poolFees: [],
    isLoadingPoolFees: false,
};

export const fetchAllPoolFeesThunk = createAsyncThunk("fees/fetchPoolFees", async (thunkApi) => {
    try {
        const data = await fetchAllFeesPool();
        return data;
    } catch (error) {
        console.error(error);
    }
});

const feesSlice = createSlice({
    name: "fees",
    initialState: initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchAllPoolFeesThunk.fulfilled, (state, action) => {
            if (!action.payload) return;
            state.poolFees = action.payload;
            state.isLoadingPoolFees = false;
        });
        builder.addCase(fetchAllPoolFeesThunk.pending, (state, action) => {
            state.isLoadingPoolFees = true;
        });
        builder.addCase(fetchAllPoolFeesThunk.rejected, (state, action) => {
            state.isLoadingPoolFees = false;
        });
    },
});

export default feesSlice.reducer;
