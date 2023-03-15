import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getEarnings } from "src/api/farms";
import farmFunctions from "src/api/pools";
import { toEth } from "src/utils/common";
import { StateInterface, FetchFarmDetailsAction, FarmDetails, Earnings, FetchEarningsAction } from "./types";

const initialState: StateInterface = { farmDetails: {}, isLoading: false, isFetched: false, account: "", earnings: {} };

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

export const updateEarnings = createAsyncThunk(
    "farms/updateEarnings",
    async ({ currentWallet, farms, decimals, prices }: FetchEarningsAction, thunkApi) => {
        const earns = await getEarnings(currentWallet);
        const earnings: Earnings = {};
        earns.forEach((item) => {
            const farm = farms.find((farm) => farm.vault_addr.toLowerCase() === item.vaultAddress)!;
            const earnedTokens = (BigInt(item.withdraw) - (BigInt(item.deposit) - BigInt(item.userBalance))).toString();
            earnings[farm.id] = Number(toEth(earnedTokens, decimals[farm.lp_address])) * prices[farm.lp_address]!;
        });
        return { earnings, currentWallet };
    }
);

const farmsSlice = createSlice({
    name: "farms",
    initialState: initialState,
    reducers: {
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
            state.isLoading = false;
            state.isFetched = true;
            state.farmDetails = { ...action.payload };
        });
        builder.addCase(updateFarmDetails.rejected, (state) => {
            state.isLoading = false;
            state.isFetched = false;
            state.farmDetails = {};
        });
        builder.addCase(updateEarnings.fulfilled, (state, action) => {
            state.earnings = { ...action.payload.earnings };
            state.account = action.payload.currentWallet;
        });
        builder.addCase(updateEarnings.rejected, (state) => {
            state.earnings = {};
        });
    },
});

export const { reset, setAccount } = farmsSlice.actions;

export default farmsSlice.reducer;
