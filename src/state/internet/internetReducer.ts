import { createSlice } from "@reduxjs/toolkit";
import { StateInterface } from "./types";

const initialState: StateInterface = {
    isOnline: window.navigator.onLine,
};

const internetSlice = createSlice({
    name: "internet",
    initialState: initialState,
    reducers: {
        setOnline: (state: StateInterface) => {
            state.isOnline = true;
        },
        setOffline: (state: StateInterface) => {
            // state.isOnline = false;
            console.log("Offline...");
        },
    },
});

export const { setOnline, setOffline } = internetSlice.actions;

export default internetSlice.reducer;
