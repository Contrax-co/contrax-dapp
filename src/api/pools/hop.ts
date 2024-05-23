import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { BigNumber, Signer, Contract, utils, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { Balances } from "src/state/balances/types";
import { Prices } from "src/state/prices/types";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DynamicFarmFunctions,
    FarmFunctions,
    GetFarmDataProcessedFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    TokenAmounts,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { Decimals } from "src/state/decimals/types";
import { defaultChainId } from "src/config/constants";
import { slippageIn, slippageOut, zapInBase, zapOutBase } from "./common";

let hop = (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> => {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
        const ethPrice = prices[constants.AddressZero];
        const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
        const vaultTokenPrice = prices[farm.vault_addr];
        const zapCurriences = farm.zap_currencies;
        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(balances[usdcAddress]!, decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(balances[usdcAddress]!, decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: toEth(balances[constants.AddressZero]!, 18),
                amountDollar: (Number(toEth(balances[constants.AddressZero]!, 18)) * ethPrice).toString(),
                price: ethPrice,
            },
        ];
        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[usdcAddress]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[usdcAddress],
                isPrimaryVault: "USDC.e" === farm.name,
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: ethPrice,
                isPrimaryVault: "ETH" === farm.name,
            },
        ];

        zapCurriences?.forEach((currency) => {
            const currencyBalance = BigNumber.from(balances[currency.address]);
            const currencyPrice = prices[currency.address];
            depositableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: toEth(currencyBalance, decimals[currency.symbol]),
                amountDollar: (Number(toEth(currencyBalance, decimals[currency.address])) * currencyPrice).toString(),
                price: prices[currency.address],
            });
            withdrawableAmounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[currency.address]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
                price: prices[currency.address],
                isPrimaryVault: currency.symbol === farm.name,
            });
        });
        return {
            depositableAmounts,
            withdrawableAmounts,
            vaultBalanceFormated: (Number(toEth(vaultTotalSupply ?? 0, farm.decimals)) * vaultTokenPrice).toString(),
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
