import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BridgeStatus, PolyUsdcToArbUsdcArgs, StateInterface } from "./types";
import { notifyLoading } from "src/api/notify";
import { addressesByChainId } from "src/config/constants/contracts";
import { awaitTransaction, sleep } from "src/utils/common";
import { approveErc20, getBalance } from "src/api/token";
import { CHAIN_ID } from "src/types/enums";
import { buildTransaction, getBridgeStatus, getRoute } from "src/api/bridge";
import { notifySuccess } from "src/api/notify";
import { notifyError } from "src/api/notify";
import { dismissNotify } from "src/api/notify";
import { v4 as uuid } from "uuid";
import { RootState } from "..";

const initialState: StateInterface = {
    onRampInProgress: false,
    beforeRampState: {
        balances: {},
    },
    bridgeState: {},
    socketSourceTxHash: "",
};

export const checkBridgeStatus = createAsyncThunk(
    "ramp/checkBridgeStatus",
    async (args: { refechBalance?: Function } | undefined, thunkApi) => {
        const notiId = uuid();
        const int = setInterval(() => {
            const { ramp } = thunkApi.getState() as RootState;
            const sourceTxHash = ramp.socketSourceTxHash;
            console.log("sourceTxHash", sourceTxHash);
            if (sourceTxHash) {
                thunkApi.dispatch(setBridgeStatus(BridgeStatus.PENDING));
                notifyLoading(
                    { title: "Checking bridge status.", message: "This will take a few minutes..." },
                    { id: notiId }
                );
                getBridgeStatus(sourceTxHash, CHAIN_ID.POLYGON, CHAIN_ID.ARBITRUM).then((res) => {
                    console.log(res);
                    if (res.destinationTxStatus === "COMPLETED") {
                        dismissNotify(notiId);
                        notifySuccess(
                            { title: "Success!", message: "Bridging completed" },
                            { dismissAfter: 0, dismissible: true }
                        );
                        thunkApi.dispatch(setSourceTxHash(""));
                        thunkApi.dispatch(setBridgeStatus(BridgeStatus.COMPLETED));
                        dismissNotify(notiId);
                        clearInterval(int);
                        thunkApi.dispatch(setIsBridging(false));
                        thunkApi.dispatch(setCheckBridgeStatus(false));
                        args?.refechBalance && args.refechBalance();
                    }
                });
            } else {
                dismissNotify(notiId);
                thunkApi.dispatch(setIsBridging(false));
                clearInterval(int);
            }
        }, 5000);
        return int;
    }
);

export const polyUsdcToArbUsdc = createAsyncThunk(
    "ramp/polyUsdcToArbUsdc",
    async ({ polygonSigner, currentWallet, refechBalance }: PolyUsdcToArbUsdcArgs, thunkApi) => {
        if (!polygonSigner) return;
        await sleep(1000);
        let notiId = notifyLoading({
            title: "Bridging Poly USDC to Arb USDC",
            message: "Getting bridge route data...",
        });
        try {
            const polyUsdcBalance = await getBalance(
                addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                currentWallet,
                polygonSigner
            );
            if (polyUsdcBalance.eq(0)) throw new Error("Insufficient balance");
            thunkApi.dispatch(setBridgeStatus(BridgeStatus.APPROVING));
            const { route, approvalData } = await getRoute(
                CHAIN_ID.POLYGON,
                CHAIN_ID.ARBITRUM,
                addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress,
                polyUsdcBalance.toString(),
                currentWallet
            );
            notifyLoading({ title: "Bridging", message: "Approving Polygon USDC - 1/3" }, { id: notiId });
            await approveErc20(
                approvalData.approvalTokenAddress,
                approvalData.allowanceTarget,
                approvalData.minimumApprovalAmount,
                currentWallet,
                polygonSigner!
            );
            console.log("approval done");
            thunkApi.dispatch(setBridgeStatus(BridgeStatus.PENDING));
            notifyLoading({ title: "Bridging", message: "Creating transaction - 2/3" }, { id: notiId });
            const buildTx = await buildTransaction(route);
            const tx = {
                to: buildTx?.txTarget,
                data: buildTx?.txData,
                value: buildTx?.value,
                chainId: buildTx?.chainId,
                gasLimit: 1000000,
            };
            notifyLoading({ title: "Bridging", message: "Sending bridge transaction - 3/3" }, { id: notiId });
            const { tx: transaction, error } = await awaitTransaction(polygonSigner?.sendTransaction(tx));
            console.log(transaction, error);
            if (error) throw new Error(error);
            const sourceTxHash: string = transaction.transactionHash || transaction.hash;
            if (sourceTxHash) {
                notifySuccess({ title: "Bridge!", message: "Transaction sent" });
            }
            thunkApi.dispatch(setSourceTxHash(sourceTxHash));
            thunkApi.dispatch(checkBridgeStatus({ refechBalance }));
            dismissNotify(notiId);
        } catch (error: any) {
            console.error(error);
            notifyError({ title: "Error!", message: error.message });
            dismissNotify(notiId);
        }
    }
);

const rampSlice = createSlice({
    name: "ramp",
    initialState: initialState,
    reducers: {
        setSourceTxHash: (state: StateInterface, action: { payload: string }) => {
            state.socketSourceTxHash = action.payload;
        },
        setBridgeStatus: (state: StateInterface, action: { payload: BridgeStatus }) => {
            state.bridgeState.status = action.payload;
        },
        setBeforeRampBalance: (state: StateInterface, action: { payload: { address: string; balance: string } }) => {
            state.beforeRampState.balances[action.payload.address] = action.payload.balance;
        },
        setIsBridging: (state: StateInterface, action: { payload: boolean }) => {
            state.bridgeState.isBridging = action.payload;
        },
        setCheckBridgeStatus: (state: StateInterface, action: { payload: boolean }) => {
            state.bridgeState.checkingStatus = action.payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(checkBridgeStatus.pending, (state: StateInterface) => {
            state.bridgeState.checkingStatus = true;
        });
        builder.addCase(polyUsdcToArbUsdc.pending, (state: StateInterface) => {
            state.bridgeState.isBridging = true;
        });
        builder.addCase(polyUsdcToArbUsdc.fulfilled, (state: StateInterface) => {
            state.bridgeState.isBridging = false;
        });
        builder.addCase(polyUsdcToArbUsdc.rejected, (state: StateInterface) => {
            state.bridgeState.isBridging = false;
        });
    },
});

export const { setSourceTxHash, setBridgeStatus, setBeforeRampBalance, setIsBridging, setCheckBridgeStatus } =
    rampSlice.actions;

export default rampSlice.reducer;
