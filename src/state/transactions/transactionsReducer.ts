import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateInterface, Transaction, TransactionStatus } from "./types";
import { backendApi } from "src/api";
import { Address, createPublicClient, http, TransactionReceipt } from "viem";
import { RootState } from "..";
import pools_json from "src/config/constants/pools_json";
import { SupportedChains } from "src/config/walletConfig";
import { IClients } from "src/types";
import moment from "moment";

const initialState: StateInterface = {
    transactions: [],
    limit: 20,
    fetchedAll: false,
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
            `transaction/tx-history?from=${walletAddress}&limit=${limit}&sort=-date${tx ? `&_id[lt]=${tx._id}` : ""}`
        );
        return { transactions: res.data.data };
    }
);

export const checkPendingTransactionsStatus = createAsyncThunk(
    "transactions/checkPendingTransactionsStatus",
    async (_, thunkApi) => {
        const txs = (thunkApi.getState() as RootState).transactions.transactions;
        const promises = txs.reduce((acc, curr) => {
            if (curr.status === TransactionStatus.PENDING && curr.txHash) {
                const chainId = pools_json.find((item) => item.id === curr.farmId)?.chainId;
                if (chainId) {
                    const chain = SupportedChains.find((item) => item.id === chainId);
                    if (!chain) throw new Error("chain not found");
                    const publicClient = createPublicClient({
                        chain: chain,
                        transport: http(),
                        batch: {
                            multicall: {
                                batchSize: 4096,
                                wait: 250,
                            },
                        },
                    }) as IClients["public"];
                    acc.push(publicClient.getTransactionReceipt({ hash: curr.txHash }));
                }
            }
            return acc;
        }, [] as Promise<TransactionReceipt>[]);
        const receipts = await Promise.all(promises);
        receipts.forEach((receipt, index) => {
            if (receipt) {
                const tx = txs.find((item) => item.txHash === receipt.transactionHash);
                if (receipt.status === "success") {
                    thunkApi.dispatch(editTransactionDb({ _id: tx?._id, status: TransactionStatus.SUCCESS }));
                } else {
                    thunkApi.dispatch(editTransactionDb({ _id: tx?._id, status: TransactionStatus.FAILED }));
                }
            }
        });
        txs.filter((item) => item.status === TransactionStatus.PENDING && !item.txHash).forEach((item) => {
            // Check if since item.date an hour has passed
            if (moment().diff(item.date, "hours") > 1) {
                thunkApi.dispatch(editTransactionDb({ _id: item._id, status: TransactionStatus.INTERRUPTED }));
            }
        });
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
        builder.addCase(getTransactionsDb.rejected, (state) => {
            state.fetchedAll = true;
        });
        builder.addCase(editTransactionDb.fulfilled, (state, action) => {
            const ind = state.transactions.findIndex((tx) => tx._id === action.payload._id);
            state.transactions[ind] = action.payload;
        });
    },
});

export const { reset } = transactionsSlice.actions;

export default transactionsSlice.reducer;
