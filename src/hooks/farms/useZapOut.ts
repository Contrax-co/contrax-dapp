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
import { useAppDispatch } from "src/state";
import { TransactionStatus } from "src/state/transactions/types";
import { addTransactionDb } from "src/state/transactions/transactionsReducer";

export interface ZapOut {
    withdrawAmt: number;
    max?: boolean;
    token: Address;
    bridgeChainId?: number;
    txId: string;
}

const useZapOut = (farm: PoolDef) => {
    const { currentWallet, getClients, getPublicClient, isSocial, estimateTxGas, getWalletClient } = useWallet();
    const { reloadBalances, balances } = useBalances();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();
    const { reloadSupplies } = useTotalSupplies();
    const dispatch = useAppDispatch();

    const _zapOut = async ({ withdrawAmt, max, token, txId, bridgeChainId }: ZapOut) => {
        if (!currentWallet) return;
        let amountInWei = toWei(withdrawAmt, farm.decimals);

        await farmFunctions[farm.id].zapOut({
            id: txId,
            amountInWei,
            getPublicClient,
            getWalletClient,
            estimateTxGas,
            decimals,
            currentWallet,
            isSocial,
            getClients,
            max,
            prices,
            token,
            bridgeChainId,
        });
        reloadBalances();
        reloadSupplies();
    };

    const slippageZapOut = async ({ withdrawAmt, max, token }: Omit<ZapOut, "txId">) => {
        if (!currentWallet) return;
        let amountInWei = toWei(withdrawAmt, farm.decimals);

        // @ts-expect-error
        const { receviedAmt, afterTxAmount, beforeTxAmount, slippage } = await farmFunctions[farm.id]?.zapOutSlippage({
            currentWallet,
            amountInWei,
            farm,
            balances,
            decimals,
            getClients,
            isSocial,
            max,
            estimateTxGas,
            getPublicClient,
            prices,
            getWalletClient,
            token,
        });

        return { afterWithdrawAmount: afterTxAmount, beforeWithdrawAmount: beforeTxAmount, slippage };
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
