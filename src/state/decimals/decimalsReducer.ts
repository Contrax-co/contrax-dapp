import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Address, erc20Abi, getAddress, getContract, zeroAddress } from "viem";
import { Decimals, StateInterface, UpdateDecimalsActionPayload } from "./types";
import tokens from "src/config/constants/tokens";
import { Common_Chains_State } from "src/config/constants/pools_json";

const initialState: StateInterface = { decimals: Common_Chains_State, isLoading: false, isFetched: false };

export const fetchDecimals = createAsyncThunk(
    "decimals/fetchDecimals",
    async ({ farms, getPublicClient }: UpdateDecimalsActionPayload) => {
        const chainIds = farms.reduce((accum, farm) => {
            if (!accum?.includes(farm.chainId)) accum.push(farm.chainId);
            return accum;
        }, [] as number[]);
        const addresses: Record<number, Set<Address>> = {};
        chainIds.forEach((chainId) => {
            addresses[chainId] = new Set();
        });
        farms.forEach((farm) => {
            addresses[farm.chainId].add(getAddress(farm.lp_address));
            addresses[farm.chainId].add(getAddress(farm.token1));
            addresses[farm.chainId].add(getAddress(farm.vault_addr));
            farm.token2 && addresses[farm.chainId].add(getAddress(farm.token2));
        });
        tokens.forEach((token) => {
            addresses[token.chainId].add(getAddress(token.address));
        });

        let decimals: Decimals = {};
        await Promise.all(
            Object.entries(addresses).map(async ([chainId, set]) => {
                decimals[Number(chainId)] = {};
                const arr = Array.from(set);
                const res = await Promise.all(
                    arr.map((item) =>
                        getContract({
                            address: item,
                            abi: erc20Abi,
                            client: {
                                public: getPublicClient(Number(chainId)),
                            },
                        }).read.decimals()
                    )
                );

                decimals[Number(chainId)][zeroAddress] = 18;
                res.forEach((item, i) => {
                    decimals[Number(chainId)][arr[i]] = Number(item);
                });
            })
        );

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
            state.decimals = Common_Chains_State;
        });
    },
});

export default decimalsSlice.reducer;
