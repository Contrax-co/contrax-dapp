import { Farm } from "src/types";
import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_WITHDRAW } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";
import { useDecimals } from "../useDecimals";
import { toEth } from "src/utils/common";
import usePriceOfTokens from "../usePriceOfTokens";
import { parseUnits } from "viem";

const useWithdraw = (farm: Farm) => {
    const { client, currentWallet, chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

    const _withdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
        if (!currentWallet) return;
        let amountInWei = parseUnits(withdrawAmount.toString(), decimals[farm.lp_address] || 18);
        await farmFunctions[farm.id].withdraw({ amountInWei, currentWallet, client, chainId, max });
        reloadBalances();
        reloadSupplies();
    };

    const slippageWithdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
        if (!currentWallet) return;
        let amountInWei = parseUnits(withdrawAmount.toString(), decimals[farm.lp_address] || 18);
        //  @ts-ignore
        const difference = await farmFunctions[farm.id]?.withdrawSlippage({
            amountInWei,
            currentWallet,
            client,
            chainId,
            max,
            farm,
        });

        const afterDepositAmount = Number(toEth(difference, decimals[farm.lp_address])) * prices[farm.lp_address];
        const beforeDepositAmount = withdrawAmount * prices[farm.lp_address];
        let slippage = (1 - afterDepositAmount / beforeDepositAmount) * 100;
        if (slippage < 0) slippage = 0;
        return { afterDepositAmount, beforeDepositAmount, slippage };
    };

    const {
        mutate: withdraw,
        mutateAsync: withdrawAsync,
        status,
    } = useMutation({
        mutationFn: _withdraw,
        mutationKey: FARM_WITHDRAW(currentWallet!, NETWORK_NAME, farm?.id || 0),
    });

    const withdrawIsMutating = useIsMutating({
        mutationKey: FARM_WITHDRAW(currentWallet!, NETWORK_NAME, farm?.id || 0),
    });

    /**
     * True if any withdraw function is runnning
     */
    const isLoading = useMemo(() => {
        return withdrawIsMutating > 0;
    }, [withdrawIsMutating]);

    return { isLoading, withdraw, withdrawAsync, status, slippageWithdraw };
};

export default useWithdraw;
