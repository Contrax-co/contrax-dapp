import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateInterface, Transaction } from "./types";

const initialState: StateInterface = {
    transactions: [],
};

const transactionsSlice = createSlice({
    name: "transactions",
    initialState: initialState,
    reducers: {
        addTransaction: (state: StateInterface, action: PayloadAction<Transaction>) => {
            state.transactions.unshift(action.payload);
        },
        editTransaction: (state: StateInterface, action: PayloadAction<Partial<Transaction> & { id: string }>) => {
            const index = state.transactions.findIndex((item) => item.id === action.payload.id);
            state.transactions[index] = { ...state.transactions[index], ...action.payload };
        },
    },
});

export const { addTransaction, editTransaction } = transactionsSlice.actions;

export default transactionsSlice.reducer;
