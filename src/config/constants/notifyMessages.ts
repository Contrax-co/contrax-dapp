import { ErrorMessages, LoadingMessages, SuccessMessages } from "src/types";

export const errorMessages: ErrorMessages = {
    generalError: (message: string) => ({
        title: "Error",
        message: message,
    }),
    insufficientGas: () => ({
        title: "Gas Fees",
        message: "Insufficient balance for gas fees",
    }),
    privateKeyError: () => ({
        title: "Error",
        message: "Cannot get private key, use your extension wallet instead",
    }),
};

export const successMessages: SuccessMessages = {
    deposit: () => ({
        title: "Deposit!",
        message: "Successful",
    }),
    zapIn: () => ({
        title: "Zapped in!",
        message: "successfully",
    }),
    withdraw: () => ({
        title: "Withdrawn!",
        message: "successfully",
    }),
    tokenTransfered: () => ({
        title: "Success",
        message: "Tokens transferred successfully",
    }),
};

export const loadingMessages: LoadingMessages = {
    approvingZapping: () => ({
        title: "Approving zapping!",
        message: "Please wait...",
    }),
    zapping: (tx: string) => ({
        title: "Zapping...",
        message: `Txn hash: ${tx}`,
    }),
    approvingWithdraw: () => ({
        title: "Approving Withdraw!",
        message: "Please wait...",
    }),
    confirmingWithdraw: () => ({
        title: "Confirming Withdraw!",
        message: "Please wait...",
    }),
    withDrawing: (tx: string) => ({
        title: "Withdrawing...",
        message: `Txn hash: ${tx}`,
    }),
    approvingDeposit: () => ({
        title: "Approving deposit!",
        message: "Please wait...",
    }),
    confirmDeposit: () => ({
        title: "Confirm Deposit!",
        message: "",
    }),
    depositing: (tx: string) => ({
        title: "Withdrawing...",
        message: `Txn hash: ${tx}`,
    }),
    transferingTokens: () => ({
        title: "Transferring...",
        message: "Please wait while we transfer your tokens",
    }),
};
