import { useMemo } from "react";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_IN } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";
import { useDecimals } from "../useDecimals";
import { toWei } from "src/utils/common";
import usePriceOfTokens from "../usePriceOfTokens";
import { toEth } from "./../../utils/common";
import { Address } from "viem";
import { PoolDef } from "src/config/constants/pools_json";

export interface ZapIn {
    zapAmount: number;
    max?: boolean;
    token: Address;
}

const useZapIn = (farm: PoolDef) => {
    const { currentWallet, getClients } = useWallet();
    const { reloadBalances, balances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

    const _zapIn = async ({ zapAmount, max, token }: ZapIn) => {
        if (!currentWallet) return;
        let amountInWei = toWei(zapAmount, decimals[farm.chainId][token]);
        await farmFunctions[farm.id].zapIn({
            currentWallet,
            amountInWei,
            balances,
            max,
            getClients,
            token,
            prices,
            decimals,
        });

        reloadBalances();
        reloadSupplies();
    };

    const slippageZapIn = async ({ zapAmount, max, token }: ZapIn) => {
        if (!currentWallet) return;
        let amountInWei = toWei(zapAmount, decimals[farm.chainId][token]);
        if (!farmFunctions[farm.id]?.zapInSlippage) throw new Error("No zapInSlippage function");
        // @ts-expect-error
        const difference = await farmFunctions[farm.id].zapInSlippage({
            currentWallet,
            amountInWei,
            balances,
            getClients,
            farm,
            max,
            token,
            prices,
            decimals,
        });
        const afterDepositAmount = Number(toEth(difference, farm.decimals)) * prices[farm.chainId][farm.vault_addr];
        const beforeDepositAmount = zapAmount * prices[farm.chainId][token];
        let slippage = (1 - afterDepositAmount / beforeDepositAmount) * 100;
        if (slippage < 0) slippage = 0;
        console.log({
            vaultPrice: prices[farm.chainId][farm.vault_addr],
            lpPrice: prices[farm.chainId][farm.lp_address],
            lpAddr: farm.lp_address,
            tokenPrice: prices[farm.chainId][token],
            tokenAddr: token,
            zapAmount,
            difference,
            differenceEth: toEth(difference),
            afterDepositAmount,
            beforeDepositAmount,
            slippage,
        });
        return { afterDepositAmount, beforeDepositAmount, slippage };
    };

    const {
        mutate: zapIn,
        mutateAsync: zapInAsync,
        status,
    } = useMutation({
        mutationFn: _zapIn,
        mutationKey: FARM_ZAP_IN(currentWallet!, farm?.id || 0),
    });

    const zapInIsMutating = useIsMutating({ mutationKey: FARM_ZAP_IN(currentWallet!, farm?.id || 0) });

    /**
     * True if any zap function is runnning
     */
    const isLoading = useMemo(() => {
        return zapInIsMutating > 0;
    }, [zapInIsMutating]);

    return { isLoading, zapIn, zapInAsync, status, slippageZapIn };
};

export default useZapIn;
