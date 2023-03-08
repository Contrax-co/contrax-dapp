import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { constants, Contract } from "ethers";
import { erc20ABI } from "wagmi";
import { StateInterface, UpdateBalancesActionPayload } from "./types";

const initialState: StateInterface = { balances: {}, isLoading: false, isFetched: false };

export const fetchBalances = createAsyncThunk(
    "balances/fetchBalances",
    async ({ farms, multicallProvider, account }: UpdateBalancesActionPayload, thunkApi) => {
        try {
            const addresses = new Set<string>();
            farms.forEach((farm) => {
                addresses.add(farm.lp_address.toLowerCase());
                addresses.add(farm.token1.toLowerCase());
                farm.token2 && addresses.add(farm.token2.toLowerCase());
                farm.vault_addr && addresses.add(farm.vault_addr.toLowerCase());
            });
            const addressesArray = Array.from(addresses);
            const promises = addressesArray.map((address) =>
                new Contract(address, erc20ABI, multicallProvider).balanceOf(account)
            );
            const [ethBalance, ...balancesResponse] = await Promise.all([
                multicallProvider.getBalance(account),
                ...promises,
            ]);
            const balances = balancesResponse.reduce((accum, balance, index) => {
                accum[addressesArray[index]] = balance.toString();
                return accum;
            }, {});
            balances[constants.AddressZero] = ethBalance.toString();
            return balances;
        } catch (error) {
            console.error(error);
        }
    }
);

const balancesSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchBalances.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchBalances.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.balances = { ...action.payload };
        });
    },
});

export const {} = balancesSlice.actions;

export default balancesSlice.reducer;
