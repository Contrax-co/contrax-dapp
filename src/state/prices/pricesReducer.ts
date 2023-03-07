import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { AddPrice, StateInterface, UpdatePricesActionPayload } from "./types";

const initialState: StateInterface = {};

export const updatePrices = createAsyncThunk("prices/updatePrices", async (payload: UpdatePricesActionPayload,thunkApi) => {
  try {
    
  } catch (error) {
    console.error(error);
  }
})

const pricesSlice = createSlice({
    name: "prices",
    initialState: initialState,
    reducers: {
        addPrice: (state: StateInterface, action: PayloadAction<AddPrice>) => {
            state = { ...state, ...action.payload };
        },
        removePrice: (state: StateInterface, action: PayloadAction<string>) => {
            delete state[action.payload];
        },
    },
});

export const { addPrice, removePrice } = pricesSlice.actions;

export default pricesSlice.reducer;
