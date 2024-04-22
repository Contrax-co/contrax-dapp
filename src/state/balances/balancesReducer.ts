import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Address, erc20Abi, getAddress, getContract, zeroAddress } from "viem";
import { StateInterface, UpdateBalancesActionPayload, UpdatePolygonBalancesActionPayload } from "./types";
import tokens from "src/config/constants/tokens";
import { defaultChainId } from "src/config/constants";

const initialState: StateInterface = {
    balances: {},
    mainnetBalances: {},
    polygonBalances: {},
    isLoading: false,
    isFetched: false,
    account: "",
};

export const fetchPolygonBalances = createAsyncThunk(
    "balances/fetchPolygonBalances",
    async ({ publicClient, account, addresses }: UpdatePolygonBalancesActionPayload, thunkApi) => {
        // console.log("fetchPolygonBalances");
        // console.trace();
        let promises = addresses.map((address) =>
            getContract({
                abi: erc20Abi,
                address: address as Address,
                client: {
                    public: publicClient,
                },
            }).read.balanceOf([account as Address])
        );

        const [maticBalance, ...balancesResponse] = await Promise.all([
            publicClient.getBalance({ address: account as Address }),
            ...promises,
        ]);

        const balances = balancesResponse.reduce((accum: { [key: string]: string }, balance, index) => {
            accum[addresses[index]] = balance.toString();
            return accum;
        }, {});

        balances[zeroAddress] = maticBalance.toString();

        // create address checksum
        const checksummed: { [key: string]: string } = {};
        Object.entries(balances).forEach(([key, value]) => {
            checksummed[getAddress(key)] = value;
        });

        return checksummed;
    }
);

export const fetchMainnetBalances = createAsyncThunk(
    "balances/fetchMainnetBalances",
    async ({ publicClient, account, addresses }: UpdatePolygonBalancesActionPayload, thunkApi) => {
        let promises = addresses.map((address) =>
            getContract({
                abi: erc20Abi,
                address: address as Address,
                client: {
                    public: publicClient,
                },
            }).read.balanceOf([account as Address])
        );

        const [ethBalance, ...balancesResponse] = await Promise.all([
            publicClient.getBalance({ address: account as Address }),
            ...promises,
        ]);

        const balances = balancesResponse.reduce((accum: { [key: string]: string }, balance, index) => {
            accum[addresses[index]] = balance.toString();
            return accum;
        }, {});

        balances[zeroAddress] = ethBalance.toString();

        // create address checksum
        const checksummed: { [key: string]: string } = {};
        Object.entries(balances).forEach(([key, value]) => {
            checksummed[getAddress(key)] = value;
        });

        return checksummed;
    }
);

export const fetchBalances = createAsyncThunk(
    "balances/fetchBalances",
    async ({ farms, publicClient, account }: UpdateBalancesActionPayload, thunkApi) => {
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
            }).read.balanceOf([account as Address])
        );
        promises = [...promises];

        const [ethBalance, ...balancesResponse] = await Promise.all([
            publicClient.getBalance({ address: account as Address }),
            ...promises,
        ]);
        const balances = balancesResponse.reduce((accum: { [key: string]: string }, balance, index) => {
            accum[addressesArray[index]] = balance.toString();
            return accum;
        }, {});
        balances[zeroAddress] = ethBalance.toString();

        // create address checksum
        const checksummed: { [key: string]: string } = {};
        Object.entries(balances).forEach(([key, value]) => {
            checksummed[getAddress(key)] = value;
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
            state.mainnetBalances = {};
            state.polygonBalances = {};
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
        builder.addCase(fetchPolygonBalances.fulfilled, (state, action) => {
            state.polygonBalances = { ...action.payload };
        });
        builder.addCase(fetchMainnetBalances.fulfilled, (state, action) => {
            state.mainnetBalances = { ...action.payload };
        });
        builder.addCase(fetchPolygonBalances.rejected, (state) => {
            state.polygonBalances = {};
        });
        builder.addCase(fetchMainnetBalances.rejected, (state) => {
            state.mainnetBalances = {};
        });
    },
});

export const { setAccount, setIsFetched, reset } = balancesSlice.actions;

export default balancesSlice.reducer;
