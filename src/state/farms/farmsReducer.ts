import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { constants, Contract } from "ethers";
import farmFunctions from "src/api/pools";
import { erc20ABI } from "wagmi";
import store, { RootState } from "..";
import { StateInterface, FetchFarmDetailsAction, FarmDetails } from "./types";

const initialState: StateInterface = { farmDetails: {}, isLoading: false, isFetched: false };

// export const fetchFarmDetails = createAsyncThunk(
//     "farms/fetchFarmDetails",
//     async ({ farms, currentWallet }: FetchFarmDetailsAction, thunkApi) => {
//         try {
//             if (!currentWallet) return;
//             const state = thunkApi.getState() as RootState;
//             const data: FarmDetails = {};
//             farms.forEach((farm) => {
//                 data[farm.id] = farmFunctions[farm.id]?.getModifiedFarmDataByEthBalance(
//                     state.balances.balances,
//                     state.prices.prices
//                 );
//             });

//             return data;
//         } catch (error) {
//             console.error(error);
//         }
//     }
// );

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
        },
    },
});

export const { updateFarmDetails } = farmsSlice.actions;

export default farmsSlice.reducer;
