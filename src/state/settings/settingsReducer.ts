import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateInterface } from "./types";

const initialState: StateInterface = {
    theme: "light",
};

const settingsSlice = createSlice({
    name: "settings",
    initialState: initialState,
    reducers: {
        setSettings: (state: StateInterface, action: PayloadAction<StateInterface>) => {
            state = action.payload;
        },
        toggleTheme: (state: StateInterface) => {
            state.theme = state.theme === "light" ? "dark" : "light";
        },
    },
});

export const { setSettings, toggleTheme } = settingsSlice.actions;

export default settingsSlice.reducer;
