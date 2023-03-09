import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { constants, Contract, utils } from "ethers";
import { erc20ABI } from "wagmi";
import { StateInterface, UpdateBalancesActionPayload, Supply, TotalSupplies } from "./types";

const initialState: StateInterface = { totalSupplies: {}, isLoading: false, isFetched: false };

export const fetchTotalSupplies = createAsyncThunk(
    "supply/fetchTotalSupplies",
    async ({ farms, multicallProvider }: UpdateBalancesActionPayload, thunkApi) => {
        try {
            const addresses = new Set<string>();
            farms.forEach((farm) => {
                addresses.add(farm.vault_addr.toLowerCase());
                addresses.add(farm.lp_address.toLowerCase());
            });
            const addressesArray = Array.from(addresses);
            let promises = addressesArray.map((address) =>
                new Contract(address, erc20ABI, multicallProvider).totalSupply()
            );
            promises = [
                ...promises,
                ...addressesArray.map((address) => new Contract(address, erc20ABI, multicallProvider).decimals()),
            ];
            const balancesResponse = await Promise.all([...promises]);
            const balances: TotalSupplies = balancesResponse
                .slice(0, balancesResponse.length / 2)
                .reduce((accum, balance, index) => {
                    accum[addressesArray[index]] = {
                        balance: balance.toString(),
                        decimals: balancesResponse[index + balancesResponse.length / 2],
                    };
                    return accum;
                }, {});

            // create address checksum
            const checksummed: { [key: string]: Supply } = {};
            Object.entries(balances).forEach(([key, value]) => {
                checksummed[utils.getAddress(key)] = value;
            });

            return checksummed;
        } catch (error) {
            console.error(error);
        }
    }
);

const supplySlice = createSlice({
    name: "supply",
    initialState: initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchTotalSupplies.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchTotalSupplies.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.totalSupplies = { ...action.payload };
        });
    },
});

export const {} = supplySlice.actions;

export default supplySlice.reducer;
