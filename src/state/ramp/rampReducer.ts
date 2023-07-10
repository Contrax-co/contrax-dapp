import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BridgeChainInfo, BridgeDirection, BridgeStatus, PolyUsdcToArbUsdcArgs, StateInterface } from "./types";
import { notifyLoading } from "src/api/notify";
import { awaitTransaction, sleep } from "src/utils/common";
import { approveErc20, getBalance } from "src/api/token";
import { buildTransaction, getBridgeStatus, getRoute } from "src/api/bridge";
import { notifySuccess } from "src/api/notify";
import { notifyError } from "src/api/notify";
import { dismissNotify } from "src/api/notify";
import { v4 as uuid } from "uuid";
import { RootState } from "..";
import { constants } from "ethers";

const initialState: StateInterface = {
    bridgeStates: {
        [BridgeDirection.USDC_POLYGON_TO_ARBITRUM_USDC]: {
            isBridging: false,
        },
        [BridgeDirection.ETH_POLYGON_TO_ARBITRUM_ETH]: {
            isBridging: false,
        },
    },
};

export const checkBridgeStatus = createAsyncThunk(
    "ramp/checkBridgeStatus",
    async (args: { refechBalance?: Function; direction: BridgeDirection }, thunkApi) => {
        const notiId = uuid();
        const int = setInterval(() => {
            const { ramp } = thunkApi.getState() as RootState;
            const sourceTxHash = ramp.bridgeStates[args.direction].socketSourceTxHash;
            if (sourceTxHash) {
                thunkApi.dispatch(setBridgeStatus({ status: BridgeStatus.PENDING, direction: args.direction }));
                notifyLoading(
                    { title: "Checking bridge status.", message: "This will take a few minutes..." },
                    { id: notiId }
                );
                const sourceChain = BridgeChainInfo[args.direction].sourceChainId;
                const dstChain = BridgeChainInfo[args.direction].dstChainId;
                getBridgeStatus(sourceTxHash, sourceChain, dstChain).then((res) => {
                    console.log(res);
                    if (res.destinationTxStatus === "COMPLETED") {
                        dismissNotify(notiId);
                        notifySuccess(
                            { title: "Success!", message: "Bridging completed" },
                            { dismissAfter: 0, dismissible: true }
                        );
                        thunkApi.dispatch(setSourceTxHash({ hash: "", direction: args.direction }));
                        thunkApi.dispatch(
                            setBridgeStatus({ status: BridgeStatus.COMPLETED, direction: args.direction })
                        );
                        dismissNotify(notiId);
                        clearInterval(int);
                        thunkApi.dispatch(setIsBridging({ value: false, direction: args.direction }));
                        thunkApi.dispatch(setCheckBridgeStatus({ value: false, direction: args.direction }));
                        args?.refechBalance && args.refechBalance();
                    }
                });
            } else {
                dismissNotify(notiId);
                thunkApi.dispatch(setIsBridging({ value: false, direction: args.direction }));
                clearInterval(int);
            }
        }, 5000);
        return int;
    }
);

export const polyUsdcToArbUsdc = createAsyncThunk(
    "ramp/polyUsdcToArbUsdc",
    async ({ polygonSigner, currentWallet, refechBalance, direction }: PolyUsdcToArbUsdcArgs, thunkApi) => {
        if (!polygonSigner) return;
        await sleep(1000);
        let notiId = notifyLoading({
            title: `Bridging Poly ${BridgeChainInfo[direction].sourceName} to Arb ${BridgeChainInfo[direction].dstName}`,
            message: "Getting bridge route data...",
        });
        try {
            const polyUsdcBalance = await getBalance(
                BridgeChainInfo[direction].sourceAddress,
                currentWallet,
                polygonSigner
            );
            if (polyUsdcBalance.eq(0)) throw new Error("Insufficient balance");
            thunkApi.dispatch(setBridgeStatus({ status: BridgeStatus.APPROVING, direction }));
            console.log("getting route");
            const { route, approvalData } = await getRoute(
                BridgeChainInfo[direction].sourceChainId,
                BridgeChainInfo[direction].dstChainId,
                BridgeChainInfo[direction].sourceAddress === constants.AddressZero
                    ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                    : BridgeChainInfo[direction].sourceAddress,
                BridgeChainInfo[direction].dstAddress === constants.AddressZero
                    ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                    : BridgeChainInfo[direction].dstAddress,
                polyUsdcBalance.toString(),
                currentWallet
            );
            console.log("got route", route);
            notifyLoading(
                { title: "Bridging", message: `Approving Polygon ${BridgeChainInfo[direction].sourceName} - 1/3` },
                { id: notiId }
            );
            await approveErc20(
                approvalData.approvalTokenAddress,
                approvalData.allowanceTarget,
                approvalData.minimumApprovalAmount,
                currentWallet,
                polygonSigner!
            );
            console.log("approval done");
            thunkApi.dispatch(setBridgeStatus({ status: BridgeStatus.PENDING, direction }));
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
            thunkApi.dispatch(setSourceTxHash({ hash: sourceTxHash, direction }));
            thunkApi.dispatch(checkBridgeStatus({ refechBalance, direction }));
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
        setSourceTxHash: (state: StateInterface, action: { payload: { hash: string; direction: BridgeDirection } }) => {
            state.bridgeStates[action.payload.direction].socketSourceTxHash = action.payload.hash;
        },
        setBridgeStatus: (
            state: StateInterface,
            action: { payload: { status: BridgeStatus; direction: BridgeDirection } }
        ) => {
            state.bridgeStates[action.payload.direction].status = action.payload.status;
        },

        setIsBridging: (state: StateInterface, action: { payload: { value: boolean; direction: BridgeDirection } }) => {
            state.bridgeStates[action.payload.direction].isBridging = action.payload.value;
        },
        setCheckBridgeStatus: (
            state: StateInterface,
            action: { payload: { value: boolean; direction: BridgeDirection } }
        ) => {
            state.bridgeStates[action.payload.direction].checkingStatus = action.payload.value;
        },
    },
    extraReducers(builder) {
        builder.addCase(checkBridgeStatus.pending, (state: StateInterface, action) => {
            state.bridgeStates[action.meta.arg.direction].checkingStatus = true;
        });
        builder.addCase(polyUsdcToArbUsdc.pending, (state: StateInterface, action) => {
            state.bridgeStates[action.meta.arg.direction].isBridging = true;
        });
        builder.addCase(polyUsdcToArbUsdc.fulfilled, (state: StateInterface, action) => {
            state.bridgeStates[action.meta.arg.direction].isBridging = false;
        });
        builder.addCase(polyUsdcToArbUsdc.rejected, (state: StateInterface, action) => {
            console.log(action.meta);
            state.bridgeStates[action.meta.arg.direction].isBridging = false;
        });
    },
});

export const { setSourceTxHash, setBridgeStatus, setIsBridging, setCheckBridgeStatus } = rampSlice.actions;

export default rampSlice.reducer;
