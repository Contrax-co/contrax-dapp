import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Contract, utils } from "ethers";
import { erc20Abi } from "viem";
import { StateInterface, UpdateBalancesActionPayload, TotalSupplies } from "./types";
import tokens from "src/config/constants/tokens";
import { defaultChainId } from "src/config/constants";

const initialState: StateInterface = { totalSupplies: {}, isLoading: false, isFetched: false };

export const fetchTotalSupplies = createAsyncThunk(
    "supply/fetchTotalSupplies",
    async ({ farms, multicallProvider }: UpdateBalancesActionPayload, thunkApi) => {
        const addresses = new Set<string>();
        farms.forEach((farm) => {
            addresses.add(farm.vault_addr.toLowerCase());
            addresses.add(farm.lp_address.toLowerCase());
        });
        tokens.forEach((token) => {
            if (token.chainId === defaultChainId) addresses.add(token.address.toLowerCase());
        });
        const addressesArray = Array.from(addresses);
        let promises = addressesArray.map((address) =>
            new Contract(address, erc20ABI, multicallProvider).totalSupply()
        );
        promises = [...promises];
        const balancesResponse = await Promise.all([...promises]);
        const balances: TotalSupplies = balancesResponse.reduce((accum, balance, index) => {
            accum[addressesArray[index]] = balance.toString();
            return accum;
        }, {});

        // create address checksum
        const checksummed: { [key: string]: string } = {};
        Object.entries(balances).forEach(([key, value]) => {
            checksummed[utils.getAddress(key)] = value;
        });
        return checksummed;
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
