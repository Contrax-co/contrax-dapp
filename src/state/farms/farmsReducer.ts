import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getEarnings } from "src/api/farms";
import farmFunctions from "src/api/pools";
import { sleep, toEth } from "src/utils/common";
import { StateInterface, FetchFarmDetailsAction, FarmDetails, Earnings, FetchEarningsAction } from "./types";
import { Contract, BigNumber, utils } from "ethers";
import VaultAbi from "src/assets/abis/vault.json";
import { erc20ABI } from "wagmi";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { Farm } from "src/types";
import { getPriceByTime, getPricesByTime } from "src/api/token";
import { Decimals } from "../decimals/types";
import { setOldPrices } from "../prices/pricesReducer";

const initialState: StateInterface = { farmDetails: {}, isLoading: false, isFetched: false, account: "", earnings: {} };

export const updateFarmDetails = createAsyncThunk(
    "farms/updateFarmDetails",
    async ({ currentWallet, farms, balances, prices }: FetchFarmDetailsAction, thunkApi) => {
        if (!currentWallet) return;
        const data: FarmDetails = {};
        farms.forEach((farm) => {
            data[farm.id] = farmFunctions[farm.id]?.getModifiedFarmDataByEthBalance(balances, prices);
        });

        thunkApi.dispatch(setAccount(currentWallet));
        return data;
    }
);

export const updateEarnings = createAsyncThunk(
    "farms/updateEarnings",
    async (
        {
            currentWallet,
            farms,
            decimals,
            prices,
            balances,
            multicallProvider,
            totalSupplies,
            chainId,
        }: FetchEarningsAction,
        thunkApi
    ) => {
        await sleep(4000);
        const earns = await getEarnings(currentWallet);
        const earnings: Earnings = {};
        const balancesPromises: Promise<BigNumber>[] = [];
        const withdrawableLpAmount: { [farmId: number]: string } = {};
        farms.forEach((farm) => {
            balancesPromises.push(new Contract(farm.vault_addr, VaultAbi, multicallProvider).balance());
            balancesPromises.push(
                new Contract(farm.lp_address, erc20ABI, multicallProvider).balanceOf(farm.vault_addr)
            );
        });
        const vaultBalancesResponse = await Promise.all(balancesPromises);
        for (let i = 0; i < vaultBalancesResponse.length; i += 2) {
            const balance = vaultBalancesResponse[i];
            const b = vaultBalancesResponse[i + 1];

            let r = balance.mul(balances[farms[i / 2].vault_addr]!).div(totalSupplies[farms[i / 2].vault_addr]!);

            if (b.lt(r)) {
                const _withdraw = r.sub(b);
                const _after = b.add(_withdraw);
                const _diff = _after.sub(b);
                if (_diff.lt(_withdraw)) {
                    r = b.add(_diff);
                }
            }
            withdrawableLpAmount[farms[i / 2].id] = r.toString();
        }

        earns.forEach((item) => {
            const farm = farms.find((farm) => farm.vault_addr.toLowerCase() === item.vaultAddress)!;
            const earnedTokens = (
                BigInt(item.withdraw) +
                BigInt(withdrawableLpAmount[farm.id]) -
                BigInt(item.deposit)
            ).toString();
            earnings[farm.id] = Number(toEth(earnedTokens, decimals[farm.lp_address])) * prices[farm.lp_address]!;
        });

        // @ts-ignore
        const oldPrices = await getPricesOfLpByTimestamp(earns, farms, multicallProvider, chainId, decimals);

        thunkApi.dispatch(setOldPrices(oldPrices));
        return { earnings, currentWallet };
    }
);

async function getPricesOfLpByTimestamp(
    lpData: {
        token0: string;
        token1: string;
        totalSupply: string;
        reserve0: string;
        reserve1: string;
        tokenId: string;
        blockTimestamp: string;
    }[],
    farms: Farm[],
    provider: MulticallProvider,
    chainId: number,
    decimals: Decimals
) {
    let prices: { [key: string]: { timestamp: number; price: number }[] } = {};
    // ----------------- Find Lp Addresses of given lpData -----------------
    const lps = lpData.map((lp) => ({
        ...lp,
        address: farms.find((farm) => farm.id === Number(lp.tokenId))!.lp_address,
    }));

    // ----------------- Get prices from api, save remaining lps whose prices not available -----------------
    const remainingLps = (
        await Promise.all(lps.map((lp) => getPriceByTime(lp.address, Number(lp.blockTimestamp), chainId)))
    )
        .map((res, index) => {
            if (res.price !== 0) {
                prices[utils.getAddress(lps[index].address)] = [{ ...res }];
                return undefined;
            }
            return { ...lps[index] };
        })
        .filter((lp) => !!lp);

    // ----------------- Get prices for tokens holded by Lps from api -----------------
    const res = await getPricesByTime(
        remainingLps.reduce((acc, curr) => {
            acc.push({
                address: curr!.token0,
                timestamp: Number(curr!.blockTimestamp),
            });
            acc.push({
                address: curr!.token1,
                timestamp: Number(curr!.blockTimestamp),
            });
            return acc;
        }, [] as { address: string; timestamp: number }[]),
        chainId
    );

    // ----------------- Set token prices in prices object along with timestamp of price -----------------
    res?.forEach((item) => {
        if (prices[utils.getAddress(item.address)]) {
            prices[utils.getAddress(item.address)].push({
                price: item.price!,
                timestamp: item.timestamp,
            });
        } else {
            prices[utils.getAddress(item.address)] = [
                {
                    price: item.price!,
                    timestamp: item.timestamp,
                },
            ];
        }
    });

    // ----------------- Calculate price of Lp by given parameters -----------------
    remainingLps.forEach((lp) => {
        if (!lp) return;
        const token0Decimals = decimals[lp.token0];
        const token1Decimals = decimals[lp.token1];
        const token0USDLiquidity = BigNumber.from(lp.reserve0)
            .mul(
                parseInt(
                    String(
                        prices[utils.getAddress(lp.token0)].find((e) => e.timestamp === Number(lp.blockTimestamp))!
                            .price * 1000
                    )
                )
            )
            .div(1000)
            .div(utils.parseUnits("1", token0Decimals));
        const token1USDLiquidity = BigNumber.from(lp.reserve1)
            .mul(
                parseInt(
                    String(
                        prices[utils.getAddress(lp.token1)].find((e) => e.timestamp === Number(lp.blockTimestamp))!
                            .price * 1000
                    )
                )
            )
            .div(1000)
            .div(utils.parseUnits("1", token1Decimals));
        let totalUSDLiquidity = utils.parseEther("0");
        if (token0USDLiquidity.gt(0) && token1USDLiquidity.gt(0)) {
            totalUSDLiquidity = token0USDLiquidity.add(token1USDLiquidity);
        } else {
            if (!token0USDLiquidity.isZero()) {
                totalUSDLiquidity = token0USDLiquidity.mul(2);
            } else if (!token1USDLiquidity.isZero()) {
                totalUSDLiquidity = token1USDLiquidity.mul(2);
            }
        }
        const price = Number(totalUSDLiquidity.toNumber() / Number(utils.formatEther(lp.totalSupply)));

        prices[utils.getAddress(lp.address)] = [{ price, timestamp: Number(lp.blockTimestamp) }];
    });

    return prices;
}

const farmsSlice = createSlice({
    name: "farms",
    initialState: initialState,
    reducers: {
        setAccount(state, action: { payload: string }) {
            state.account = action.payload;
        },
        reset(state) {
            state.farmDetails = {};
            state.isLoading = false;
            state.isFetched = false;
            state.account = "";
        },
    },
    extraReducers(builder) {
        builder.addCase(updateFarmDetails.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateFarmDetails.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.farmDetails = { ...action.payload };
        });
        builder.addCase(updateFarmDetails.rejected, (state) => {
            state.isLoading = false;
            state.isFetched = false;
            state.farmDetails = {};
        });
        builder.addCase(updateEarnings.fulfilled, (state, action) => {
            state.earnings = { ...action.payload.earnings };
            state.account = action.payload.currentWallet;
        });
        builder.addCase(updateEarnings.rejected, (state) => {
            state.earnings = {};
        });
    },
});

export const { reset, setAccount } = farmsSlice.actions;

export default farmsSlice.reducer;
