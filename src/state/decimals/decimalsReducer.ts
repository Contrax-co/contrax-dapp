import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { constants, Contract, utils } from "ethers";
import { erc20ABI } from "wagmi";
import { Decimals, StateInterface, UpdateDecimalsActionPayload } from "./types";

const initialState: StateInterface = { decimals: {}, isLoading: false, isFetched: false };

export const fetchDecimals = createAsyncThunk(
    "decimals/fetchDecimals",
    async ({ farms, multicallProvider }: UpdateDecimalsActionPayload) => {
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
                new Contract(address, erc20ABI, multicallProvider).decimals()
            );

            const decimalsResponses = await Promise.all(promises);

            const decimals: Decimals = decimalsResponses.reduce((accum, decimals, index) => {
                accum[utils.getAddress(addressesArray[index])] = decimals;
                return accum;
            }, {});

            decimals[constants.AddressZero] = 18;

            return decimals;
        } catch (error) {
            console.error(error);
        }
    }
);

const decimalsSlice = createSlice({
    name: "decimals",
    initialState: initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchDecimals.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchDecimals.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.decimals = { ...action.payload };
        });
    },
});

export default decimalsSlice.reducer;
