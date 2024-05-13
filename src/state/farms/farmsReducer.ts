import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEarnings } from "src/api/farms";
import farmFunctions from "src/api/pools";
import { sleep, toEth } from "src/utils/common";
import {
    StateInterface,
    FetchFarmDetailsAction,
    FarmDetails,
    Earnings,
    FetchEarningsAction,
    FarmDetailInputOptions,
} from "./types";
import { Contract, BigNumber } from "ethers";
import VaultAbi from "src/assets/abis/vault.json";
import { erc20ABI } from "wagmi";
import { getPricesOfLpByTimestamp } from "../prices/pricesReducer";
import { IS_LEGACY, defaultChainId } from "src/config/constants";
import { FarmTransactionType } from "src/types/enums";

const initialState: StateInterface = {
    farmDetails: {},
    isLoading: false,
    isFetched: false,
    account: "",
    earnings: {},
    isLoadingEarnings: false,
    farmDetailInputOptions: {
        transactionType: FarmTransactionType.Deposit,
        showInUsd: true,
        currencySymbol: "USDC",
    },
};

export const updateFarmDetails = createAsyncThunk(
    "farms/updateFarmDetails",
    async ({ currentWallet, farms, totalSupplies, balances, prices, decimals }: FetchFarmDetailsAction, thunkApi) => {
        if (!currentWallet) return;
        try {
            const data: FarmDetails = {};
            farms.forEach((farm) => {
                // @ts-ignore
                if (farmFunctions[farm.id]?.getProcessedFarmData)
                    data[farm.id] = farmFunctions[farm.id]?.getProcessedFarmData(
                        balances,
                        prices,
                        decimals,
                        totalSupplies[farm.vault_addr]
                    );
            });
            const usdcI = data[farms[0].id]?.depositableAmounts.findIndex((item) => item.tokenSymbol === "USDC");
            const ethI = data[farms[0].id]?.depositableAmounts.findIndex((item) => item.tokenSymbol === "ETH");

            if (
                Number(data[farms[0].id]?.depositableAmounts[ethI!].amountDollar) >
                Number(data[farms[0].id]?.depositableAmounts[usdcI!].amountDollar)
            ) {
                thunkApi.dispatch(setCurrencySymbol("ETH"));
            }

            return { data, currentWallet };
        } catch (error) {
            console.error(error);
            thunkApi.rejectWithValue(error);
        }
    }
);

export const updateEarnings = createAsyncThunk(
    "farms/updateEarnings",
    async (
        {
            currentWallet,
            farms,
            decimals,
            prices,
            balances,
            multicallProvider,
            totalSupplies,
            chainId,
        }: FetchEarningsAction,
        thunkApi
    ) => {
        try {
            if (chainId !== defaultChainId) throw new Error("Wrong chain");
            await sleep(6000);
            const earns = await getEarnings(currentWallet);
            if (!earns) {
                // throw new Error("No data");
                return thunkApi.rejectWithValue("");
            }

            const earnings: Earnings = {};
            const balancesPromises: Promise<BigNumber>[] = [];
            const withdrawableLpAmount: { [farmId: number]: string } = {};
            farms.forEach((farm) => {
                balancesPromises.push(new Contract(farm.vault_addr, VaultAbi, multicallProvider).balance());
                balancesPromises.push(
                    new Contract(farm.lp_address, erc20ABI, multicallProvider).balanceOf(farm.vault_addr)
                );
            });
            const vaultBalancesResponse = await Promise.all(balancesPromises);
            for (let i = 0; i < vaultBalancesResponse.length; i += 2) {
                const balance = vaultBalancesResponse[i];
                const b = vaultBalancesResponse[i + 1];

                let r = balance.mul(balances[farms[i / 2].vault_addr]!);
                if (totalSupplies[farms[i / 2].vault_addr] !== "0") r = r.div(totalSupplies[farms[i / 2].vault_addr]!);
                if (b.lt(r)) {
                    const _withdraw = r.sub(b);
                    const _after = b.add(_withdraw);
                    const _diff = _after.sub(b);
                    if (_diff.lt(_withdraw)) {
                        r = b.add(_diff);
                    }
                }
                withdrawableLpAmount[farms[i / 2].id] = r.toString();
            }
            earns.forEach((item) => {
                const farm = farms.find((farm) => farm.vault_addr.toLowerCase() === item.vaultAddress)!;
                const earnedTokens = (
                    BigInt(item.withdraw) +
                    BigInt(withdrawableLpAmount[farm.id]) -
                    BigInt(item.deposit)
                ).toString();
                earnings[farm.id] = Number(toEth(earnedTokens, decimals[farm.lp_address])) * prices[farm.lp_address]!;
                if (earnings[farm.id] < 0.0001) earnings[farm.id] = 0;
            });
            thunkApi.dispatch(
                // @ts-ignore
                getPricesOfLpByTimestamp({ farms, chainId, lpData: earns, provider: multicallProvider, decimals })
            );
            return { earnings, currentWallet };
        } catch (error) {
            console.error(error);
            return thunkApi.rejectWithValue("");
        }
    }
);

const farmsSlice = createSlice({
    name: "farms",
    initialState: initialState,
    reducers: {
        setAccount(state, action: { payload: string }) {
            state.account = action.payload;
        },
        setFarmDetailInputOptions(state, action: { payload: Partial<FarmDetailInputOptions> }) {
            state.farmDetailInputOptions = { ...state.farmDetailInputOptions, ...action.payload };
            if (IS_LEGACY) state.farmDetailInputOptions.transactionType = FarmTransactionType.Withdraw;
        },
        reset(state) {
            state.farmDetails = {};
            state.isLoading = false;
            state.isFetched = false;
            state.account = "";
        },
        setCurrencySymbol(state, action: { payload: string }) {
            state.farmDetailInputOptions.currencySymbol = action.payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(updateFarmDetails.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateFarmDetails.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.farmDetails = { ...action.payload!.data };
            state.account = action.payload!.currentWallet;
        });
        builder.addCase(updateFarmDetails.rejected, (state) => {
            state.isLoading = false;
            state.isFetched = false;
            state.farmDetails = {};
        });
        builder.addCase(updateEarnings.pending, (state) => {
            state.isLoadingEarnings = true;
        });
        builder.addCase(updateEarnings.fulfilled, (state, action) => {
            state.earnings = { ...action.payload.earnings };
            state.account = action.payload.currentWallet;
            state.isLoadingEarnings = false;
        });
        builder.addCase(updateEarnings.rejected, (state) => {
            state.earnings = {};
            state.isLoadingEarnings = false;
        });
    },
});

export const { reset, setAccount, setFarmDetailInputOptions, setCurrencySymbol } = farmsSlice.actions;

export default farmsSlice.reducer;
