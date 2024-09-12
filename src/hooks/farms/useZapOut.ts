import { useMemo } from "react";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_OUT } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";
import { useDecimals } from "../useDecimals";
import { toEth, toWei } from "src/utils/common";
import usePriceOfTokens from "../usePriceOfTokens";
import { Address } from "viem";
import { PoolDef } from "src/config/constants/pools_json";
import { v4 as uuid } from "uuid";
import { useAppDispatch } from "src/state";
import { TransactionStatus } from "src/state/transactions/types";
import { addTransaction } from "src/state/transactions/transactionsReducer";

export interface ZapOut {
    withdrawAmt: number;
    max?: boolean;
    token: Address;
}

const useZapOut = (farm: PoolDef) => {
    const { currentWallet, getClients, getPublicClient, isSocial, estimateTxGas, getWalletClient } = useWallet();
    const { reloadBalances, balances } = useBalances();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();
    const { reloadSupplies } = useTotalSupplies();
    const dispatch = useAppDispatch();

    const _zapOut = async ({ withdrawAmt, max, token }: ZapOut) => {
        if (!currentWallet) return;
        let amountInWei = toWei(withdrawAmt, farm.decimals);
        const id = uuid();
        dispatch(
            addTransaction({
                amountInWei: amountInWei.toString(),
                date: new Date().toString(),
                type: "withdraw",
                farmId: farm.id,
                id,
                max: !!max,
                status: TransactionStatus.PENDING,
                token,
            })
        );
        await farmFunctions[farm.id].zapOut({
            id,
            amountInWei,
            getPublicClient,
            getWalletClient,
            estimateTxGas,
            currentWallet,
            isSocial,
            getClients,
            max,
            token,
        });
        reloadBalances();
        reloadSupplies();
    };

    const slippageZapOut = async ({ withdrawAmt, max, token }: ZapOut) => {
        if (!currentWallet) return;
        let amountInWei = toWei(withdrawAmt, farm.decimals);

        // @ts-expect-error
        const difference = await farmFunctions[farm.id]?.zapOutSlippage({
            currentWallet,
            amountInWei,
            farm,
            balances,
            getClients,
            isSocial,
            max,
            estimateTxGas,
            getPublicClient,
            getWalletClient,
            token,
        });
        const afterWithdrawAmount =
            Number(toEth(difference, decimals[farm.chainId][token])) * prices[farm.chainId][token];
        const beforeWithdrawAmount = withdrawAmt * prices[farm.chainId][farm.vault_addr];
        let slippage = (1 - afterWithdrawAmount / beforeWithdrawAmount) * 100;
        if (slippage < 0) slippage = 0;
        return { afterWithdrawAmount, beforeWithdrawAmount, slippage };
    };

    const {
        mutate: zapOut,
        mutateAsync: zapOutAsync,
        status,
    } = useMutation({
        mutationFn: _zapOut,
        mutationKey: FARM_ZAP_OUT(currentWallet!, farm?.id || 0),
    });

    const zapOutIsMutating = useIsMutating({ mutationKey: FARM_ZAP_OUT(currentWallet!, farm?.id || 0) });

    /**
     * True if any zap function is runnning
     */
    const isLoading = useMemo(() => {
        return zapOutIsMutating > 0;
    }, [zapOutIsMutating]);

    return { isLoading, zapOut, zapOutAsync, status, slippageZapOut };
};

export default useZapOut;
