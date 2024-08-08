import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Address, erc20Abi, getAddress, getContract } from "viem";
import { StateInterface, UpdateBalancesActionPayload, TotalSupplies } from "./types";
import tokens from "src/config/constants/tokens";
import { CHAIN_ID } from "src/types/enums";

const initialState: StateInterface = {
    totalSupplies: {
        [CHAIN_ID.ARBITRUM]: {},
        [CHAIN_ID.MAINNET]: {},
        [CHAIN_ID.POLYGON]: {},
    },
    isLoading: false,
    isFetched: false,
};

export const fetchTotalSupplies = createAsyncThunk(
    "supply/fetchTotalSupplies",
    async ({ farms, getPublicClient }: UpdateBalancesActionPayload, thunkApi) => {
        const chainIds = farms.reduce((accum, farm) => {
            if (!accum?.includes(farm.chainId)) accum.push(farm.chainId);
            return accum;
        }, [] as number[]);
        const addresses: Record<number, Set<Address>> = {};
        chainIds.forEach((chainId) => {
            addresses[chainId] = new Set();
        });
        farms.forEach((farm) => {
            addresses[farm.chainId].add(getAddress(farm.vault_addr));
            addresses[farm.chainId].add(getAddress(farm.lp_address));
        });
        tokens.forEach((token) => {
            addresses[token.chainId].add(getAddress(token.address));
        });
        let balances: TotalSupplies = {};
        await Promise.all(
            Object.entries(addresses).map(async ([chainId, set]) => {
                balances[Number(chainId)] = {};
                const arr = Array.from(set);
                const res = await Promise.all(
                    arr.map((item) =>
                        getContract({
                            address: item,
                            abi: erc20Abi,
                            client: {
                                public: getPublicClient(Number(chainId)),
                            },
                        }).read.totalSupply()
                    )
                );

                res.forEach((item, i) => {
                    balances[Number(chainId)][arr[i]] = item.toString();
                });
            })
        );

        return balances;
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
