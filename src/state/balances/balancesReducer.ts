import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { constants, Contract, utils } from "ethers";
import { erc20ABI } from "wagmi";
import { Balances, StateInterface, UpdateBalancesActionPayload } from "./types";

const initialState: StateInterface = { balances: {}, isLoading: false, isFetched: false, account: "" };

export const fetchBalances = createAsyncThunk(
    "balances/fetchBalances",
    async ({ farms, multicallProvider, account }: UpdateBalancesActionPayload, thunkApi) => {
        const addresses = new Set<string>();
        farms.forEach((farm) => {
            addresses.add(farm.lp_address.toLowerCase());
            addresses.add(farm.token1.toLowerCase());
            farm.token2 && addresses.add(farm.token2.toLowerCase());
            farm.vault_addr && addresses.add(farm.vault_addr.toLowerCase());
        });
        const addressesArray = Array.from(addresses);
        let promises = addressesArray.map((address) =>
            new Contract(address, erc20ABI, multicallProvider).balanceOf(account)
        );
        promises = [...promises];
        const [ethBalance, ...balancesResponse] = await Promise.all([
            multicallProvider.getBalance(account),
            ...promises,
        ]);
        const balances = balancesResponse.reduce((accum: { [key: string]: string }, balance, index) => {
            accum[addressesArray[index]] = balance.toString();
            return accum;
        }, {});
        balances[constants.AddressZero] = ethBalance.toString();

        // create address checksum
        const checksummed: { [key: string]: string } = {};
        Object.entries(balances).forEach(([key, value]) => {
            checksummed[utils.getAddress(key)] = value;
        });
        thunkApi.dispatch(setAccount(account));

        return checksummed;
    }
);

const balancesSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        setAccount(state, action: { payload: string }) {
            state.account = action.payload;
        },
        setIsFetched(state, action: { payload: boolean }) {
            state.isFetched = action.payload;
        },
        reset(state) {
            state.balances = {};
            state.isLoading = false;
            state.isFetched = false;
            state.account = "";
        },
    },
    extraReducers(builder) {
        builder.addCase(fetchBalances.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchBalances.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.balances = { ...action.payload };
        });
        builder.addCase(fetchBalances.rejected, (state) => {
            state.isLoading = false;
            state.isFetched = false;
            state.balances = {};
        });
    },
});

export const { setAccount, setIsFetched, reset } = balancesSlice.actions;

export default balancesSlice.reducer;
