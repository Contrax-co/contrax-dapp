import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { constants, Contract, utils } from "ethers";
import { erc20ABI } from "wagmi";
import { Balance, Balances, StateInterface, UpdateBalancesActionPayload } from "./types";

const initialState: StateInterface = { balances: {}, isLoading: false, isFetched: false, account: "" };

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
            let promises = addressesArray.map((address) =>
                new Contract(address, erc20ABI, multicallProvider).balanceOf(account)
            );
            promises = [
                ...promises,
                ...addressesArray.map((address) => new Contract(address, erc20ABI, multicallProvider).decimals()),
            ];
            const [ethBalance, ...balancesResponse] = await Promise.all([
                multicallProvider.getBalance(account),
                ...promises,
            ]);
            const balances: Balances = balancesResponse
                .slice(0, balancesResponse.length / 2)
                .reduce((accum, balance, index) => {
                    accum[addressesArray[index]] = {
                        balance: balance.toString(),
                        decimals: balancesResponse[index + balancesResponse.length / 2],
                    };
                    return accum;
                }, {});
            balances[constants.AddressZero] = { balance: ethBalance.toString(), decimals: 18 };

            // create address checksum
            const checksummed: { [key: string]: Balance } = {};
            Object.entries(balances).forEach(([key, value]) => {
                checksummed[utils.getAddress(key)] = value;
            });
            thunkApi.dispatch(setAccount(account));

            return checksummed;
        } catch (error) {
            console.error(error);
        }
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
        }
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
    },
});

export const { setAccount ,setIsFetched} = balancesSlice.actions;

export default balancesSlice.reducer;
