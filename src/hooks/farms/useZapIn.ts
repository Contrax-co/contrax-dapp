import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
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

export interface ZapIn {
    zapAmount: number;
    max?: boolean;
    token: string;
}

const useZapIn = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances, balances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

    const _zapIn = async ({ zapAmount, max, token }: ZapIn) => {
        let amountInWei = toWei(zapAmount, decimals[token]);
        await farmFunctions[farm.id].zapIn({
            currentWallet,
            amountInWei,
            balances,
            signer,
            chainId,
            max,
            token,
        });

        reloadBalances();
        reloadSupplies();
    };

    const slippageZapIn = async ({ zapAmount, max, token }: ZapIn) => {
        let amountInWei = toWei(zapAmount, decimals[token]);

        //  @ts-ignore
        const difference = await farmFunctions[farm.id]?.zapInSlippage({
            currentWallet,
            amountInWei,
            balances,
            signer,
            chainId,
            max,
            token,
        });
        const afterDepositAmount = Number(toEth(difference)) * prices[farm.vault_addr];
        const beforeDepositAmount = zapAmount * prices[token];
        let slippage = (1 - afterDepositAmount / beforeDepositAmount) * 100;
        if (slippage < 0) slippage = 0;
        console.log({
            vaultPrice: prices[farm.vault_addr],
            lpPrice: prices[farm.lp_address],
            lpAddr: farm.lp_address,
            tokenPrice: prices[token],
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
        mutationKey: FARM_ZAP_IN(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const zapInIsMutating = useIsMutating(FARM_ZAP_IN(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any zap function is runnning
     */
    const isLoading = useMemo(() => {
        return zapInIsMutating > 0;
    }, [zapInIsMutating]);

    return { isLoading, zapIn, zapInAsync, status, slippageZapIn };
};

export default useZapIn;
