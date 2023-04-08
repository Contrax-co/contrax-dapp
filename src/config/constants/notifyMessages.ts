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
        title: "Successfully staked!",
        message: "",
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
        title: "Approving zap!",
        message: "Please wait...",
    }),
    zapping: (tx?: string) => ({
        title: "Creating your staking position...",
        message: `Please wait...`,
    }),
    approvingWithdraw: () => ({
        title: "Approving Withdraw!",
        message: "Please wait...",
    }),
    confirmingWithdraw: () => ({
        title: "Confirming Withdraw!",
        message: "Please wait...",
    }),
    withDrawing: (tx?: string) => ({
        title: "Withdrawing...",
        message: `Please wait...`,
    }),
    approvingDeposit: () => ({
        title: "Approving deposit!",
        message: "Please wait...",
    }),
    confirmDeposit: () => ({
        title: "Confirm Deposit!",
        message: "",
    }),
    depositing: (tx?: string) => ({
        title: "Depositing...",
        message: `Please wait...`,
    }),
    transferingTokens: () => ({
        title: "Transferring...",
        message: "Please wait while we transfer your tokens",
    }),
};
