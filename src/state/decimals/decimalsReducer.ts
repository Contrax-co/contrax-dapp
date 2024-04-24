import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Address, erc20Abi, getAddress, getContract, zeroAddress } from "viem";
import { Decimals, StateInterface, UpdateDecimalsActionPayload } from "./types";
import tokens from "src/config/constants/tokens";
import { defaultChainId } from "src/config/constants";

const initialState: StateInterface = { decimals: {}, isLoading: false, isFetched: false };

export const fetchDecimals = createAsyncThunk(
    "decimals/fetchDecimals",
    async ({ farms, publicClient }: UpdateDecimalsActionPayload) => {
        const addresses = new Set<string>();
        farms.forEach((farm) => {
            addresses.add(farm.lp_address.toLowerCase());
            addresses.add(farm.token1.toLowerCase());
            farm.token2 && addresses.add(farm.token2.toLowerCase());
            farm.vault_addr && addresses.add(farm.vault_addr.toLowerCase());
        });
        tokens.forEach((token) => {
            if (token.chainId === defaultChainId) addresses.add(token.address.toLowerCase());
        });
        const addressesArray = Array.from(addresses);

        let promises = addressesArray.map((address) =>
            getContract({
                abi: erc20Abi,
                address: address as Address,
                client: {
                    public: publicClient,
                },
            }).read.decimals()
        );

        const decimalsResponses = await Promise.all(promises);

        const decimals: Decimals = decimalsResponses.reduce((accum, decimals, index) => {
            accum[getAddress(addressesArray[index])] = decimals;
            return accum;
        }, {} as Decimals);

        decimals[zeroAddress] = 18;

        return decimals;
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
        builder.addCase(fetchDecimals.rejected, (state) => {
            state.isLoading = false;
            state.isFetched = false;
            state.decimals = {};
        });
    },
});

export default decimalsSlice.reducer;
