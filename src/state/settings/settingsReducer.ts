import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateInterface } from "./types";

const initialState: StateInterface = {
    theme: "light",
    supportChat: true,
    showVaultsWithFunds: false,
    showTokenDetailedBalances: false,
};

const settingsSlice = createSlice({
    name: "settings",
    initialState: initialState,
    reducers: {
        toggleShowVaultsWithFunds: (state: StateInterface) => {
            state.showVaultsWithFunds = !state.showVaultsWithFunds;
        },
        setSettings: (state: StateInterface, action: PayloadAction<StateInterface>) => {
            state = action.payload;
        },
        toggleTheme: (state: StateInterface) => {
            state.theme = state.theme === "light" ? "dark" : "light";
        },
        toggleSupportChat: (state: StateInterface) => {
            state.supportChat = !state.supportChat;
        },
        toggleTokenDetailBalances: (state: StateInterface, action: PayloadAction<boolean>) => {
            state.showTokenDetailedBalances = action.payload;
        },
    },
});

export const { setSettings, toggleTheme, toggleTokenDetailBalances, toggleSupportChat, toggleShowVaultsWithFunds } =
    settingsSlice.actions;

export default settingsSlice.reducer;
