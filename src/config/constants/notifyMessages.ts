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
        title: "Creating your stake position...",
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
        message: `Your deposit is in progress`,
    }),
    transferingTokens: () => ({
        title: "Transferring...",
        message: "Your transfer is in progress",
    }),
    gettingBridgeQuote: () => ({
        title: "Creating your stake position...",
        message: "Getting Quote for Bridge",
    }),
    bridgeStep: (step: number, totalSteps: number) => ({
        title: "Creating your stake position...",
        message: `Bridge Step ${step} of ${totalSteps}`,
    }),
    bridgeDestTxWait: () => ({
        title: "Creating your stake position...",
        message: `Waiting for destination transaction to be mined`,
    }),
    withdrawBridgeQuote: () => ({
        title: "Withdrawing...",
        message: "Getting Quote for Bridge",
    }),
    withdrawBridgeStep: (step: number, totalSteps: number) => ({
        title: "Withdrawing...",
        message: `Bridge Step ${step} of ${totalSteps}`,
    }),
    withdrawBridgeDestTxWait: () => ({
        title: "Withdrawing...",
        message: `Waiting for destination transaction to be mined`,
    }),
};
