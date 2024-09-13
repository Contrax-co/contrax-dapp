import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateInterface, Transaction } from "./types";
import { backendApi } from "src/api";
import { Address } from "viem";
import { RootState } from "..";

const initialState: StateInterface = {
    transactions: [],
    limit: 10,
};

export const addTransactionDb = createAsyncThunk(
    "transactions/addTransactionDb",
    async (transaction: Omit<Transaction, "_id">, _thunkApi) => {
        const res = await backendApi.post("transaction/save-history-tx", transaction);
        return res.data.data;
    }
);

export const editTransactionDb = createAsyncThunk(
    "transactions/editTransactionDb",
    async (transaction: Partial<Transaction>, _thunkApi) => {
        const res = await backendApi.post(`transaction/save-history-tx/${transaction._id}`, transaction);
        return res.data.data;
    }
);

export const getTransactionsDb = createAsyncThunk(
    "transactions/getTransactionsDb",
    async ({ walletAddress }: { walletAddress: Address }, _thunkApi) => {
        const tx = (_thunkApi.getState() as RootState).transactions.transactions.at(-1);
        const limit = (_thunkApi.getState() as RootState).transactions.limit;
        const res = await backendApi.get(
            `transaction/tx-history?from=${walletAddress}&limit=${limit}&sort=-date${tx ? `&_id[gt]=${tx._id}` : ""}`
        );
        return { transactions: res.data.data };
    }
);

const transactionsSlice = createSlice({
    name: "transactions",
    initialState: initialState,
    reducers: {
        reset: (state) => {
            state.transactions = [];
        },
    },

    extraReducers: (builder) => {
        builder.addCase(addTransactionDb.fulfilled, (state, action) => {
            state.transactions.unshift(action.payload);
        });
        builder.addCase(getTransactionsDb.fulfilled, (state, action) => {
            state.transactions = state.transactions.concat(action.payload.transactions);
        });
        builder.addCase(editTransactionDb.fulfilled, (state, action) => {
            const ind = state.transactions.findIndex((tx) => tx._id === action.payload._id);
            state.transactions[ind] = action.payload;
        });
    },
});

export const { reset } = transactionsSlice.actions;

export default transactionsSlice.reducer;
