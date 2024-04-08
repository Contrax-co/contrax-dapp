import { useMemo } from "react";
import { Farm } from "src/types";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_OUT } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";
import { useDecimals } from "../useDecimals";
import { toEth, toWei } from "src/utils/common";
import usePriceOfTokens from "../usePriceOfTokens";

export interface ZapOut {
    withdrawAmt: number;
    max?: boolean;
    token: string;
}

const useZapOut = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances, balances } = useBalances();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();
    const { reloadSupplies } = useTotalSupplies();

    const _zapOut = async ({ withdrawAmt, max, token }: ZapOut) => {
        let amountInWei = toWei(withdrawAmt, farm.decimals);
        await farmFunctions[farm.id].zapOut({ amountInWei, currentWallet, signer, chainId, max, token });
        reloadBalances();
        reloadSupplies();
    };

    const slippageZapOut = async ({ withdrawAmt, max, token }: ZapOut) => {
        let amountInWei = toWei(withdrawAmt, decimals[farm.lp_address]);

        //  @ts-ignore
        const difference = await farmFunctions[farm.id]?.zapOutSlippage({
            currentWallet,
            amountInWei,
            balances,
            signer,
            chainId,
            max,
            token,
        });
        const afterWithdrawAmount = Number(toEth(difference, decimals[token])) * prices[token];
        const beforeWithdrawAmount = withdrawAmt * prices[farm.vault_addr];
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
        mutationKey: FARM_ZAP_OUT(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const zapOutIsMutating = useIsMutating(FARM_ZAP_OUT(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any zap function is runnning
     */
    const isLoading = useMemo(() => {
        return zapOutIsMutating > 0;
    }, [zapOutIsMutating]);

    return { isLoading, zapOut, zapOutAsync, status, slippageZapOut };
};

export default useZapOut;
