import { createSlice } from "@reduxjs/toolkit";
import { BridgeStatus, StateInterface } from "./types";

const initialState: StateInterface = {
    onRampInProgress: false,
    beforeRampState: {
        balances: {},
    },
    bridgeState: {},
};

const rampSlice = createSlice({
    name: "ramp",
    initialState: initialState,
    reducers: {
        setSourceTxHash: (state: StateInterface, action: { payload: string }) => {
            state.bridgeState.sourceTxHash = action.payload;
        },
        setBridgeStatus: (state: StateInterface, action: { payload: BridgeStatus }) => {
            state.bridgeState.status = action.payload;
        },
        setBeforeRampBalance: (state: StateInterface, action: { payload: { address: string; balance: string } }) => {
            state.beforeRampState.balances[action.payload.address] = action.payload.balance;
        },
    },
});

export const { setSourceTxHash, setBridgeStatus, setBeforeRampBalance } = rampSlice.actions;

export default rampSlice.reducer;
