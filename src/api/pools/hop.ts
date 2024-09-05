import { getCombinedBalance, toEth } from "src/utils/common";
import {
    FarmFunctions,
    GetFarmDataProcessedFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    TokenAmounts,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { defaultChainId } from "src/config/constants";
import { slippageIn, slippageOut, zapInBase, zapOutBase } from "./common";
import { zeroAddress } from "viem";
import pools_json from "src/config/constants/pools_json";

let hop = (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> => {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr] || 0);
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const zapCurriences = farm.zap_currencies;
        const combinedUsdcBalance = getCombinedBalance(balances, "usdc");
        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: combinedUsdcBalance.formattedBalance.toString(),
                amountDollar: combinedUsdcBalance.formattedBalance.toString(),
                price: prices[farm.chainId][usdcAddress],
            },
            {
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: toEth(BigInt(balances[farm.chainId][zeroAddress]!), 18),
                amountDollar: (Number(toEth(BigInt(balances[farm.chainId][zeroAddress]!), 18)) * ethPrice).toString(),
                price: ethPrice,
            },
        ];
        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[farm.chainId][usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[farm.chainId][usdcAddress],
                isPrimaryVault: "USDC.e" === farm.name,
            },
            {
                tokenAddress: zeroAddress,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: ethPrice,
                isPrimaryVault: "ETH" === farm.name,
            },
        ];

        zapCurriences?.forEach((currency) => {
            const currencyBalance = BigInt(balances[farm.chainId][currency.address] || 0);
            const currencyPrice = prices[farm.chainId][currency.address];
            depositableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: toEth(currencyBalance, decimals[farm.chainId][currency.address]),
                amountDollar: (
                    Number(toEth(currencyBalance, decimals[farm.chainId][currency.address])) * currencyPrice
                ).toString(),
                price: prices[farm.chainId][currency.address],
            });
            withdrawableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[farm.chainId][currency.address]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[farm.chainId][currency.address],
                isPrimaryVault: currency.symbol === farm.name,
            });
        });
        return {
            depositableAmounts,
            withdrawableAmounts,
            vaultBalanceFormated: (
                Number(toEth(BigInt(vaultTotalSupply || 0n), farm.decimals)) * vaultTokenPrice
            ).toString(),
            id: farm.id,
        };
    };

    const zapIn: ZapInFn = (props) => zapInBase({ ...props, tokenIn: farm.token1, farm });
    const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, tokenIn: farm.token1, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
    const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

    return { zapIn, zapOut, getProcessedFarmData, zapInSlippage, zapOutSlippage };
};

export default hop;
