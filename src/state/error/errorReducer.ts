import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateInterface } from "./types";

const initialState: StateInterface = {
    errorCount: 0,
    isError: false,
};

const errorSlice = createSlice({
    name: "error",
    initialState: initialState,
    reducers: {
        setError: (state: StateInterface, action: PayloadAction<StateInterface>) => {
            state = action.payload;
        },
        resetErrorCount: (state: StateInterface) => {
            state.errorCount = 0;
            state.isError = false;
        },
        incrementErrorCount: (state: StateInterface) => {
            state.errorCount++;
            if (state.errorCount >= 2) state.isError = true;
        },
    },
});

export const { setError, resetErrorCount, incrementErrorCount } = errorSlice.actions;

export default errorSlice.reducer;
