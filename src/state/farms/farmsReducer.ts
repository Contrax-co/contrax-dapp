import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import farmFunctions from "src/api/pools";
import { StateInterface, FetchFarmDetailsAction, FarmDetails } from "./types";

const initialState: StateInterface = { farmDetails: {}, isLoading: false, isFetched: false, account: "" };

export const updateFarmDetails = createAsyncThunk(
    "farms/updateFarmDetails",
    async ({ currentWallet, farms, balances, prices }: FetchFarmDetailsAction, thunkApi) => {
        if (!currentWallet) return;
        const data: FarmDetails = {};
        farms.forEach((farm) => {
            data[farm.id] = farmFunctions[farm.id]?.getModifiedFarmDataByEthBalance(balances, prices);
        });

        thunkApi.dispatch(setAccount(currentWallet));
        return data;
    }
);

const farmsSlice = createSlice({
    name: "farms",
    initialState: initialState,
    reducers: {
        // updateFarmDetails: (
        //     state,
        //     { payload: { currentWallet, farms, balances, prices } }: PayloadAction<FetchFarmDetailsAction>
        // ) => {
        //     if (!currentWallet) return;
        //     const data: FarmDetails = {};
        //     // farms.forEach((farm) => {
        //     //     data[farm.id] = farmFunctions[farm.id]?.getModifiedFarmDataByEthBalance(balances, prices);
        //     // });
        //     // state.farmDetails = data;
        //     // state.account = currentWallet;
        // },
        setAccount(state, action: { payload: string }) {
            state.account = action.payload;
        },
        reset(state) {
            state.farmDetails = {};
            state.isLoading = false;
            state.isFetched = false;
            state.account = "";
        },
    },
    extraReducers(builder) {
        builder.addCase(updateFarmDetails.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateFarmDetails.fulfilled, (state, action) => {
            console.log("updateFarmDetails.fulfilled", action.payload);
            state.isLoading = false;
            state.isFetched = true;
            state.farmDetails = { ...action.payload };
        });
        builder.addCase(updateFarmDetails.rejected, (state) => {
            state.isLoading = false;
            state.isFetched = false;
            state.farmDetails = {};
        });
    },
});

export const { reset, setAccount } = farmsSlice.actions;

export default farmsSlice.reducer;
