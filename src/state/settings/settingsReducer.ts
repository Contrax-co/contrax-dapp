import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateInterface } from "./types";

const initialState: StateInterface = {
    theme: "light",
    supportChat: true,
    connectorId: "",
    earnTrax: false,
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
        toggleSupportChat: (state: StateInterface) => {
            state.supportChat = !state.supportChat;
        },
        setConnectorId: (state: StateInterface, action: PayloadAction<string>) => {
            state.connectorId = action.payload;
        },
        setEarnTrax: (state: StateInterface, action: PayloadAction<boolean>) => {
            state.earnTrax = action.payload;
        },
    },
});

export const { setSettings, toggleTheme, toggleSupportChat, setConnectorId, setEarnTrax } = settingsSlice.actions;

export default settingsSlice.reducer;
