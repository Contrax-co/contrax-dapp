import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import farmFunctions from "src/api/pools";
import { StateInterface, FetchFarmDetailsAction, FarmDetails } from "./types";

const initialState: StateInterface = { farmDetails: {}, isLoading: false, isFetched: false, account: "" };

const farmsSlice = createSlice({
    name: "farms",
    initialState: initialState,
    reducers: {
        updateFarmDetails: (
            state,
            { payload: { currentWallet, farms, balances, prices } }: PayloadAction<FetchFarmDetailsAction>
        ) => {
            if (!currentWallet) return;
            const data: FarmDetails = {};
            farms.forEach((farm) => {
                data[farm.id] = farmFunctions[farm.id]?.getModifiedFarmDataByEthBalance(balances, prices);
            });
            state.farmDetails = data;
            state.account = currentWallet;
        },
        reset(state) {
            state.farmDetails = {};
            state.isLoading = false;
            state.isFetched = false;
            state.account = "";
        },
    },
});

export const { updateFarmDetails, reset } = farmsSlice.actions;

export default farmsSlice.reducer;
