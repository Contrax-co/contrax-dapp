import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Boosts, StateInterface } from "./types";
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
            console.log(data);

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
                if (data.earnTraxTermsAgreed) {
                    thunkApi.dispatch(setEarnTraxTermsAgreed(data.earnTraxTermsAgreed || false));
                }
                // if (data.referralCode) {
                thunkApi.dispatch(setReferralCode(data.referralCode || ""));
                // }
                // if (data.earnedTrax) {
                thunkApi.dispatch(setEarnedTrax(data.earnedTrax || 0));
                // }
                // if (data.earnedTraxByReferral) {
                thunkApi.dispatch(setEarnedTraxByReferral(data.earnedTraxByReferral || 0));
                // }
                // if (data.totalEarnedTrax) {
                thunkApi.dispatch(setTotalEarnedTrax(data.totalEarnedTrax || 0));
                // }
                // if (data.totalEarnedTraxByReferral) {
                thunkApi.dispatch(setTotalEarnedTraxByReferral(data.totalEarnedTraxByReferral || 0));
                // }
                // if (data.traxCalculatedTimestamp) {
                thunkApi.dispatch(setTraxCalculatedTimestamp(data.traxCalculatedTimestamp || 0));
                // }
                thunkApi.dispatch(setBoosts(data.boosts || []));
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
        setEarnedTrax: (state: StateInterface, action: { payload: number }) => {
            state.earnedTrax = action.payload;
        },
        setEarnedTraxByReferral: (state: StateInterface, action: { payload: number }) => {
            state.earnedTraxByReferral = action.payload;
        },
        setTotalEarnedTrax: (state: StateInterface, action: { payload: number }) => {
            state.totalEarnedTrax = action.payload;
        },
        setTotalEarnedTraxByReferral: (state: StateInterface, action: { payload: number }) => {
            state.totalEarnedTraxByReferral = action.payload;
        },
        setTraxCalculatedTimestamp: (state: StateInterface, action: { payload: number }) => {
            state.traxCalculatedTimestamp = action.payload;
        },
        setBoosts: (state: StateInterface, action: { payload: Boosts[] }) => {
            state.boosts = action.payload;
        },
        reset: (state: StateInterface) => {
            return { ...initialState, referrerCode: state.referrerCode };
        },
        setEarnTraxTermsAgreed: (state: StateInterface, action: { payload: boolean }) => {
            state.earnTraxTermsAgreed = action.payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(getReferralEarning.fulfilled, (state, action) => {
            state.referralEarning = action.payload;
        });
    },
});

export const {
    setRefAddress,
    setReferrerCode,
    reset,
    setReferralCode,
    setEarnedTrax,
    setEarnedTraxByReferral,
    setTotalEarnedTrax,
    setTotalEarnedTraxByReferral,
    setTraxCalculatedTimestamp,
    setReferralEarning,
    setEarnTraxTermsAgreed,
    setBoosts,
} = accountSlice.actions;

export default accountSlice.reducer;
