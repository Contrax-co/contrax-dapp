import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AccountResponse, StateInterface } from "./types";
import { backendApi } from "src/api";

const initialState: StateInterface = {};

const getAccountData = createAsyncThunk("account/getAccountData", async (address: string, thunkApi) => {
    if (!address) {
        thunkApi.dispatch(reset());
        return;
    }
    const res = await backendApi.get<{ data: AccountResponse | null }>("account/" + address);
    if (!res.data?.data) {
        thunkApi.dispatch(reset());
        return;
    }
    const data = res.data.data;
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
            const {
                data: { data },
            } = await backendApi.get<{ data: AccountResponse | null }>("account/" + address);

            // if account is not exist, create new account
            if (!data) {
                // Create
                const res = await backendApi.post<{ data: AccountResponse | null }>("account", {
                    address,
                    referrer: referrerCode,
                });
                // Save
                if (res.data.data?.address) {
                    thunkApi.dispatch(getAccountData(res.data.data.address));
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
        reset: (state: StateInterface) => {
            return { ...initialState, referrerCode: state.referrerCode };
        },
    },
});

export const { setRefAddress, setReferrerCode, reset, setReferralCode } = accountSlice.actions;

export default accountSlice.reducer;
