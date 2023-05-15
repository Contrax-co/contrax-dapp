import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AccountResponse, StateInterface } from "./types";
import {
    postAccountData as postAccountDataApi,
    getAccountData as getAccountDataApi,
    getReferalEarning as getReferalEarningApi,
} from "src/api/account";

const initialState: StateInterface = {};

const getAccountData = createAsyncThunk("account/getAccountData", async (address: string, thunkApi) => {
    console.log("in action");
    if (!address) {
        thunkApi.dispatch(reset());
        return;
    }
    const data = await getAccountDataApi(address);
    if (!data) {
        thunkApi.dispatch(reset());
        return;
    }

    thunkApi.dispatch(setReferrerCode(""));
    if (data.referralCode) {
        thunkApi.dispatch(setReferralCode(data.referralCode));
    }
    if (data.referrer) {
        thunkApi.dispatch(setRefAddress(data.referrer.address));
    }
});

export const addAccount = createAsyncThunk(
    "account/addAccount",
    async ({ address, referrerCode }: { address?: string; referrerCode?: string }, thunkApi) => {
        try {
            if (!address) {
                thunkApi.dispatch(reset());
                return;
            }
            // Get current account data
            const data = await getAccountDataApi(address);

            // if account is not exist, create new account
            if (!data) {
                // Create
                const res = await postAccountDataApi(address, referrerCode);

                // Save
                if (res?.address) {
                    thunkApi.dispatch(getAccountData(res.address));
                    // remove code of person whose link used to come on site
                }
            } else {
                // remove code of person whose link used to come on site
                thunkApi.dispatch(setReferrerCode(""));
                if (data.referrer) {
                    thunkApi.dispatch(setRefAddress(data.referrer.address));
                }
                if (data.referralCode) {
                    thunkApi.dispatch(setReferralCode(data.referralCode));
                }
            }
        } catch (error) {
            console.log("Cannot create new account");
        }
    }
);

export const getReferralEarning = createAsyncThunk("account/getReferralEarning", async (address: string) => {
    const amountInUSD = await getReferalEarningApi(address);
    return amountInUSD;
});

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        setRefAddress: (state: StateInterface, action: { payload: string }) => {
            state.referrerAddress = action.payload;
        },
        setReferrerCode: (state: StateInterface, action: { payload: string }) => {
            state.referrerCode = action.payload;
        },
        setReferralCode: (state: StateInterface, action: { payload: string }) => {
            state.referralCode = action.payload;
        },
        setReferralEarning: (state: StateInterface, action: { payload: number }) => {
            state.referralEarning = action.payload;
        },
        reset: (state: StateInterface) => {
            return { ...initialState, referrerCode: state.referrerCode };
        },
    },
    extraReducers(builder) {
        builder.addCase(getReferralEarning.fulfilled, (state, action) => {
            state.referralEarning = action.payload;
        });
    },
});

export const { setRefAddress, setReferrerCode, reset, setReferralCode } = accountSlice.actions;

export default accountSlice.reducer;
