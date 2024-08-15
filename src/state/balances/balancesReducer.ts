import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Address, erc20Abi, getAddress, getContract, zeroAddress } from "viem";
import { Balances, StateInterface, UpdateBalancesActionPayload } from "./types";
import tokens from "src/config/constants/tokens";
import { Common_Chains_State, pools_chain_ids } from "src/config/constants/pools_json";

const initialState: StateInterface = {
    balances: Common_Chains_State,
    isLoading: false,
    isFetched: false,
    account: undefined,
};

export const fetchBalances = createAsyncThunk(
    "balances/fetchBalances",
    async ({ farms, getPublicClient, account }: UpdateBalancesActionPayload, thunkApi) => {
        const addresses: Record<number, Set<Address>> = {};
        pools_chain_ids.forEach((chainId) => {
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

        let balances: Balances = {};
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
                        }).read.balanceOf([account])
                    )
                );

                res.forEach((item, i) => {
                    balances[Number(chainId)][arr[i]] = item.toString();
                });
            })
        );
        await Promise.all(
            pools_chain_ids.map(async (item) => {
                const bal = await getPublicClient(item).getBalance({ address: account });
                balances[item][zeroAddress] = bal.toString();
            })
        );

        thunkApi.dispatch(setAccount(account));
        return balances;
    }
);

const balancesSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        setAccount(state, action: { payload: Address }) {
            state.account = action.payload;
        },
        setIsFetched(state, action: { payload: boolean }) {
            state.isFetched = action.payload;
        },
        reset(state) {
            state.balances = {};
            pools_chain_ids.forEach((chainId) => {
                state.balances[chainId] = [] as any;
            });
            state.isLoading = false;
            state.isFetched = false;
            state.account = undefined;
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
            state.balances = Common_Chains_State;
        });
    },
});

export const { setAccount, setIsFetched, reset } = balancesSlice.actions;

export default balancesSlice.reducer;
