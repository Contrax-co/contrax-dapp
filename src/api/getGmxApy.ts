// @ts-nocheck
import { Contract, providers, utils, BigNumber, Wallet } from "ethers";
import ReaderV2 from "src/assets/abis/gmx/ReaderV2.json";
import RewardReader from "src/assets/abis/gmx/RewardReader.json";
import Vault from "src/assets/abis/gmx/Vault.json";
import UniPool from "src/assets/abis/gmx/UniPool.json";
import { Token as UniToken } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import { Apys } from "src/types";
import { calcCompoundingApy } from "src/utils/common";

const addresses = {
    bnGmxAddress: "0x35247165119B69A40edD5304969560D0ef486921",
    bonusGmxTrackerAddress: "0x4d268a7d4C16ceB5a606c173Bd974984343fea13",
    esGmxAddress: "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA",
    feeGlpTrackerAddress: "0x4e971a87900b931fF39d1Aad67697F49835400b6",
    feeGmxTrackerAddress: "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",
    glpAddress: "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258",
    gmxAddress: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    nativeTokenAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    readerAddress: "0x2b43c90D1B727cEe1Df34925bcd5Ace52Ec37694",
    rewardReaderAddress: "0x8BFb8e82Ee4569aee78D03235ff465Bd436D40E0",
    stakedGlpTrackerAddress: "0x1aDDD80E6039594eE970E5872D247bf0414C8903",
    stakedGmxTrackerAddress: "0x908C4D94D34924765f1eDc22A1DD098397c59dD4",
    vaultAddress: "0x489ee077994B6658eAfA855C308275EAd8097C4A",
    UniswapGmxEthPool: "0x80A9ae39310abf666A87C743d6ebBD0E8C42158E",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
};

const walletTokens = [
    addresses.gmxAddress,
    addresses.esGmxAddress,
    addresses.glpAddress,
    addresses.stakedGmxTrackerAddress,
];
const depositTokens = [
    addresses.gmxAddress,
    addresses.esGmxAddress,
    addresses.stakedGmxTrackerAddress,
    addresses.bonusGmxTrackerAddress,
    addresses.bnGmxAddress,
    addresses.glpAddress,
];
const rewardTrackersForDepositBalances = [
    addresses.stakedGmxTrackerAddress,
    addresses.stakedGmxTrackerAddress,
    addresses.bonusGmxTrackerAddress,
    addresses.feeGmxTrackerAddress,
    addresses.feeGmxTrackerAddress,
    addresses.feeGlpTrackerAddress,
];
const rewardTrackersForStakingInfo = [
    addresses.stakedGmxTrackerAddress,
    addresses.bonusGmxTrackerAddress,
    addresses.feeGmxTrackerAddress,
    addresses.stakedGlpTrackerAddress,
    addresses.feeGlpTrackerAddress,
];
const ARBITRUM = 42161;

function getBalanceAndSupplyData(balances: any) {
    if (!balances || balances.length === 0) {
        return {};
    }

    const keys = ["gmx", "esGmx", "glp", "stakedGmxTracker"];
    const supplyData = {};
    const propsLength = 2;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        supplyData[key] = balances[i * propsLength + 1];
    }

    return { supplyData };
}

function getDepositBalanceData(depositBalances: any) {
    if (!depositBalances || depositBalances.length === 0) {
        return;
    }

    const keys = [
        "gmxInStakedGmx",
        "esGmxInStakedGmx",
        "stakedGmxInBonusGmx",
        "bonusGmxInFeeGmx",
        "bnGmxInFeeGmx",
        "glpInStakedGlp",
    ];
    const data = {};

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        data[key] = depositBalances[i];
    }

    return data;
}
function getStakingData(stakingInfo: any) {
    if (!stakingInfo || stakingInfo.length === 0) {
        return;
    }

    const keys = ["stakedGmxTracker", "bonusGmxTracker", "feeGmxTracker", "stakedGlpTracker", "feeGlpTracker"];
    const data = {};
    const propsLength = 5;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        data[key] = {
            claimable: stakingInfo[i * propsLength],

            tokensPerInterval: stakingInfo[i * propsLength + 1],

            averageStakedAmounts: stakingInfo[i * propsLength + 2],

            cumulativeRewards: stakingInfo[i * propsLength + 3],

            totalSupply: stakingInfo[i * propsLength + 4],
        };
    }

    return data;
}

function bigNumberify(n: any) {
    try {
        return BigNumber.from(n);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("bigNumberify error", e);
        return undefined;
    }
}
function expandDecimals(n: any, decimals: number): BigNumber {
    // @ts-ignore
    return bigNumberify(n).mul(bigNumberify(10).pow(decimals));
}
interface ProcessedData {
    stakedGmxTrackerSupply: BigNumber;
    stakedGmxTrackerSupplyUsd: BigNumber;
    bnGmxInFeeGmx: BigNumber;
    bonusGmxInFeeGmx: BigNumber;
    feeGmxSupply: BigNumber;
    feeGmxSupplyUsd: BigNumber;
    boostBasisPoints: BigNumber;
    stakedGmxTrackerAnnualRewardsUsd: BigNumber;
    feeGmxTrackerAnnualRewardsUsd: BigNumber;
    gmxAprForNativeToken: BigNumber;
    gmxAprForEsGmx: BigNumber;
    gmxBoostAprForNativeToken: BigNumber;
    gmxAprTotal: BigNumber;
    gmxAprTotalWithBoost: BigNumber;
    gmxAprForNativeTokenWithBoost: BigNumber;
}
export const SECONDS_PER_YEAR = 31536000;
export const BASIS_POINTS_DIVISOR = 10000;

function getProcessedData(
    supplyData?: { stakedGmxTracker: BigNumber },
    depositBalanceData?: { bnGmxInFeeGmx: BigNumber; bonusGmxInFeeGmx: BigNumber },
    stakingData?: {
        feeGmxTracker: { totalSupply: BigNumber; tokensPerInterval: BigNumber };
        stakedGmxTracker: { tokensPerInterval: BigNumber };
    },
    nativeTokenPrice?: BigNumber,
    gmxPrice?: BigNumber
): Partial<ProcessedData> {
    if (!supplyData || !depositBalanceData || !stakingData || !nativeTokenPrice || !gmxPrice) {
        return {};
    }
    const data: Partial<ProcessedData> = {};

    data.stakedGmxTrackerSupply = supplyData.stakedGmxTracker;
    data.stakedGmxTrackerSupplyUsd = supplyData.stakedGmxTracker.mul(gmxPrice).div(expandDecimals(1, 18));

    data.bnGmxInFeeGmx = depositBalanceData.bnGmxInFeeGmx;
    data.bonusGmxInFeeGmx = depositBalanceData.bonusGmxInFeeGmx;
    data.feeGmxSupply = stakingData.feeGmxTracker.totalSupply;
    data.feeGmxSupplyUsd = data.feeGmxSupply.mul(gmxPrice).div(expandDecimals(1, 18));

    data.boostBasisPoints = BigNumber.from(0)!;
    if (data && data.bnGmxInFeeGmx && data.bonusGmxInFeeGmx && data.bonusGmxInFeeGmx.gt(0)) {
        data.boostBasisPoints = data.bnGmxInFeeGmx.mul(BASIS_POINTS_DIVISOR).div(data.bonusGmxInFeeGmx);
    }

    data.stakedGmxTrackerAnnualRewardsUsd = stakingData.stakedGmxTracker.tokensPerInterval
        .mul(SECONDS_PER_YEAR)
        .mul(gmxPrice)
        .div(expandDecimals(1, 18));
    data.gmxAprForEsGmx =
        data.stakedGmxTrackerSupplyUsd && data.stakedGmxTrackerSupplyUsd.gt(0)
            ? data.stakedGmxTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.stakedGmxTrackerSupplyUsd)
            : BigNumber.from(0)!;
    data.feeGmxTrackerAnnualRewardsUsd = stakingData.feeGmxTracker.tokensPerInterval
        .mul(SECONDS_PER_YEAR)
        .mul(nativeTokenPrice)
        .div(expandDecimals(1, 18));
    data.gmxAprForNativeToken =
        data.feeGmxSupplyUsd && data.feeGmxSupplyUsd.gt(0)
            ? data.feeGmxTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.feeGmxSupplyUsd)
            : BigNumber.from(0)!;
    data.gmxBoostAprForNativeToken = data.gmxAprForNativeToken.mul(data.boostBasisPoints).div(BASIS_POINTS_DIVISOR);
    data.gmxAprTotal = data.gmxAprForNativeToken.add(data.gmxAprForEsGmx);
    data.gmxAprTotalWithBoost = data.gmxAprForNativeToken.add(data.gmxBoostAprForNativeToken).add(data.gmxAprForEsGmx);
    data.gmxAprForNativeTokenWithBoost = data.gmxAprForNativeToken.add(data.gmxBoostAprForNativeToken);

    return data;
}
export const getGmxApyArbitrum = async (provider?: providers.Provider, currentWallet?: string): Promise<Apys> => {
    if (!provider) return;
    if (!currentWallet) {
        currentWallet = Wallet.createRandom().address;
    }
    const reader = new Contract(addresses.readerAddress, ReaderV2, provider);
    const rewardReader = new Contract(addresses.rewardReaderAddress, RewardReader, provider);
    const vault = new Contract(addresses.vaultAddress, Vault, provider);
    const uniPool = new Contract(addresses.UniswapGmxEthPool, UniPool, provider);
    const walletBalances = await reader.getTokenBalancesWithSupplies(currentWallet, walletTokens);
    const depositBalances = await rewardReader.getDepositBalances(
        currentWallet,
        depositTokens,
        rewardTrackersForDepositBalances
    );
    const stakingInfo = await rewardReader.getStakingInfo(currentWallet, rewardTrackersForStakingInfo);
    const nativeTokenPrice = await vault.getMinPrice(addresses.nativeTokenAddress);
    const uniPoolSlot0 = await uniPool.slot0();
    const ethAddress = addresses.WETH;
    const ethPrice = await vault.getMinPrice(ethAddress);

    const getGmxPrice = () => {
        if (uniPoolSlot0 && ethPrice) {
            const tokenA = new UniToken(ARBITRUM, ethAddress, 18, "SYMBOL", "NAME");

            const gmxAddress = addresses.GMX;
            const tokenB = new UniToken(ARBITRUM, gmxAddress, 18, "SYMBOL", "NAME");

            const pool = new Pool(
                tokenA, // tokenA
                tokenB, // tokenB
                10000, // fee
                uniPoolSlot0.sqrtPriceX96, // sqrtRatioX96
                1, // liquidity
                uniPoolSlot0.tick, // tickCurrent
                []
            );

            const poolTokenPrice = pool.priceOf(tokenB).toSignificant(6);
            const poolTokenPriceAmount = utils.parseUnits(poolTokenPrice, 18);
            return poolTokenPriceAmount?.mul(ethPrice).div(expandDecimals(1, 18));
        }
    };
    const gmxPrice = getGmxPrice();
    const { supplyData } = getBalanceAndSupplyData(walletBalances);
    const depositBalanceData = getDepositBalanceData(depositBalances);
    const stakingData = getStakingData(stakingInfo);
    // @ts-ignore
    const processedData = getProcessedData(supplyData, depositBalanceData, stakingData, nativeTokenPrice, gmxPrice);
    const APR = Number(processedData?.gmxAprTotalWithBoost?.toString()) / 100;
    const ETH_APR = Number(processedData?.gmxAprForNativeTokenWithBoost?.toString()) / 100;
    const esGMX_APR = Number(processedData?.gmxAprForEsGmx?.toString()) / 100;
    const compounding = calcCompoundingApy(APR);
    const res = {
        apy: APR + compounding,
        compounding,
        feeApr: 0,
        rewardsApr: APR,
    };
    return res;
};
