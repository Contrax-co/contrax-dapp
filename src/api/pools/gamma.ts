// TODO: refactor this to prevent code duplication
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

let gamma = (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> => {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[farm.chainId][zeroAddress];
        const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr] || 0);
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const combinedUsdcBalance = getCombinedBalance(balances, farm.chainId, "usdc");
        const combinedEthBalance = getCombinedBalance(balances, farm.chainId, "native");
        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;
        let isCrossChain = true;
        const usdcCurrentChainBalance = Number(toEth(combinedUsdcBalance.chainBalances[farm.chainId], 6));
        if (usdcCurrentChainBalance >= 100) isCrossChain = false;

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
                tokenSymbol: combinedEthBalance.symbol,
                amount: combinedEthBalance.formattedBalance.toString(),
                amountDollar: (Number(combinedEthBalance.formattedBalance) * ethPrice).toString(),
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
                tokenSymbol: combinedEthBalance.symbol,
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: ethPrice,
                isPrimaryVault: "ETH" === farm.name,
            },
        ];

        return {
            depositableAmounts,
            withdrawableAmounts,
            isCrossChain,
            vaultBalanceFormated: (
                Number(toEth(BigInt(vaultTotalSupply || 0n), farm.decimals)) * vaultTokenPrice
            ).toString(),
            id: farm.id,
        };
    };

    const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });
    const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
    const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

    return { zapIn, zapOut, getProcessedFarmData, zapInSlippage, zapOutSlippage };
};

export default gamma;
