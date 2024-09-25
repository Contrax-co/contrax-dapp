import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { StateInterface, Transaction, TransactionStep, TransactionStepStatus, TransactionTypes } from "./types";
import { backendApi } from "src/api";
import { Address, createPublicClient, Hex, http, TransactionReceipt } from "viem";
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
        return { ...res.data.data };
    }
);

export const editTransactionDb = createAsyncThunk(
    "transactions/editTransactionDb",
    async (transaction: Partial<Transaction>, _thunkApi) => {
        const res = await backendApi.post(`transaction/save-history-tx/${transaction._id}`, transaction);
        return res.data.data;
    }
);

export const addTransactionStepDb = createAsyncThunk(
    "transactions/addTransactionStepDb",
    async (params: { step: TransactionStep; transactionId: string }, _thunkApi) => {
        // TODO: add step to db
        const res = await backendApi.post(`transaction/add-transaction-step/${params.transactionId}`, params.step);
        return params;
    }
);

export const editTransactionStepDb = createAsyncThunk(
    "transactions/editTransactionStepDb",
    async (
        params: {
            transactionId: string;
            txHash?: Hex;
            stepType: string;
            status: TransactionStepStatus;
            amount?: string;
        },
        _thunkApi
    ) => {
        const tx = (_thunkApi.getState() as RootState).transactions.transactions.find(
            (item) => item._id === params.transactionId
        )!;

        const ind = tx.steps.findIndex((ele) => ele.type === params.stepType);
        // TODO: edit step in db
        const res = await backendApi.post(`transaction/edit-transaction-step/${params.transactionId}/${ind}`, {
            ...tx.steps[ind],
            amount: params.amount || tx.steps[ind].amount,
            status: params.status,
            // @ts-ignore
            txHash: params.txHash || tx.steps[ind].txHash,
        });
        return params;
    }
);

export const markAsFailedDb = createAsyncThunk(
    "transactions/markAsFailedDb",
    async (transactionId: string, _thunkApi) => {
        // TODO: mark as failed in db
        const tx = (_thunkApi.getState() as RootState).transactions.transactions.find(
            (item) => item._id === transactionId
        )!;
        const ind = tx.steps.length - 1;
        const res = await backendApi.post(`transaction/save-history-tx/${transactionId}`, {
            $set: { [`steps.${ind}`]: { status: TransactionStepStatus.FAILED } },
        });
        return transactionId;
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
        // return { transactions: [] };
    }
);

export const checkPendingTransactionsStatus = createAsyncThunk(
    "transactions/checkPendingTransactionsStatus",
    async (_, thunkApi) => {
        const txs = (thunkApi.getState() as RootState).transactions.transactions;
        const promises = txs.reduce((acc, curr) => {
            const lastStep = curr.steps.at(-1);
            if (
                lastStep &&
                lastStep.type === TransactionTypes.WAIT_FOR_CONFIRMATION &&
                lastStep.status === TransactionStepStatus.IN_PROGRESS &&
                lastStep.txHash
            ) {
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
                    acc.push(publicClient.getTransactionReceipt({ hash: lastStep.txHash }));
                }
            }
            return acc;
        }, [] as Promise<TransactionReceipt>[]);
        const receipts = await Promise.all(promises);
        receipts.forEach((receipt, index) => {
            if (receipt) {
                const tx = txs.find((item) => item.steps.at(-1)?.txHash === receipt.transactionHash);
                if (!tx) return;
                if (receipt.status === "success") {
                    thunkApi.dispatch(
                        editTransactionStepDb({
                            transactionId: tx._id,
                            stepType: TransactionTypes.WAIT_FOR_CONFIRMATION,
                            status: TransactionStepStatus.COMPLETED,
                        })
                    );
                } else {
                    thunkApi.dispatch(
                        editTransactionStepDb({
                            transactionId: tx._id,
                            stepType: TransactionTypes.WAIT_FOR_CONFIRMATION,
                            status: TransactionStepStatus.FAILED,
                        })
                    );
                    thunkApi.dispatch(
                        editTransactionStepDb({
                            transactionId: tx._id,
                            stepType: TransactionTypes.WAIT_FOR_CONFIRMATION,
                            status: TransactionStepStatus.FAILED,
                        })
                    );
                }
            }
        });

        txs.filter((item) => item.steps.length > 0).forEach((item) => {
            const lastStep = item.steps.at(-1)!;
            // Check if since item.date an hour has passed
            if (lastStep.status === TransactionStepStatus.IN_PROGRESS)
                if (moment().diff(item.date, "hours") > 1) {
                    editTransactionStepDb({
                        transactionId: item._id,
                        stepType: lastStep.type,
                        status: TransactionStepStatus.FAILED,
                    });
                }
        });
        // txs.filter((item) => !item.txHash && item.status === TransactionStatus.BRIDGING && item.bridgeInfo).forEach(
        //     (item) => {
        //         const { fromChain, toChain, txHash } = item.bridgeInfo!;
        //         if (item.bridgeInfo!.bridgeService === BridgeService.LIFI) {
        //             getStatus({
        //                 txHash,
        //                 fromChain,
        //                 toChain,
        //                 bridge: item.bridgeInfo!.tool,
        //             }).then((res) => {
        //                 if (res.status === "DONE") {
        //                     thunkApi.dispatch(
        //                         editTransactionDb({ _id: item._id, status: TransactionStatus.INTERRUPTED })
        //                     );
        //                 } else if (res.status === "FAILED") {
        //                     thunkApi.dispatch(editTransactionDb({ _id: item._id, status: TransactionStatus.FAILED }));
        //                 }
        //             });
        //         } else if (item.bridgeInfo!.bridgeService === BridgeService.SOCKET_TECH) {
        //             getBridgeStatus(item.bridgeInfo!.txHash, item.bridgeInfo!.fromChain, item.bridgeInfo!.toChain).then(
        //                 (res) => {
        //                     if (res.destinationTxStatus === "COMPLETED") {
        //                         thunkApi.dispatch(
        //                             editTransactionDb({ _id: item._id, status: TransactionStatus.INTERRUPTED })
        //                         );
        //                     }
        //                 }
        //             );
        //         }
        //     }
        // );
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
        builder.addCase(addTransactionStepDb.fulfilled, (state, action) => {
            const ind = state.transactions.findIndex((tx) => tx._id === action.payload.transactionId);
            state.transactions[ind].steps.push(action.payload.step);
        });
        builder.addCase(markAsFailedDb.fulfilled, (state, action) => {
            const ind = state.transactions.findIndex((tx) => tx._id === action.payload);
            state.transactions[ind].steps.at(-1)!.status = TransactionStepStatus.FAILED;
        });
        builder.addCase(editTransactionStepDb.fulfilled, (state, action) => {
            const ind = state.transactions.findIndex((tx) => tx._id === action.payload.transactionId);
            const stepInd = state.transactions[ind].steps.findIndex((step) => step.type === action.payload.stepType);
            state.transactions[ind].steps[stepInd].status = action.payload.status;
            // @ts-ignore
            if (action.payload.txHash) state.transactions[ind].steps[stepInd].txHash = action.payload.txHash;
            if (action.payload.amount) state.transactions[ind].steps[stepInd].amount = action.payload.amount;
        });
        builder.addCase(editTransactionDb.fulfilled, (state, action) => {
            const ind = state.transactions.findIndex((tx) => tx._id === action.payload._id);
            state.transactions[ind] = action.payload;
        });
    },
});

export const { reset } = transactionsSlice.actions;

export default transactionsSlice.reducer;
