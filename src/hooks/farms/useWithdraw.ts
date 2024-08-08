import { useMemo } from "react";
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
import { PoolDef } from "src/config/constants/pools_json";

const useWithdraw = (farm: PoolDef) => {
    const { currentWallet, getClients } = useWallet();

    const { reloadBalances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

    const _withdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
        if (!currentWallet) return;
        let amountInWei = parseUnits(withdrawAmount.toString(), decimals[farm.chainId][farm.lp_address] || 18);
        await farmFunctions[farm.id].withdraw({ amountInWei, currentWallet, getClients, max });
        reloadBalances();
        reloadSupplies();
    };

    const slippageWithdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
        if (!currentWallet) return;
        let amountInWei = parseUnits(withdrawAmount.toString(), decimals[farm.chainId][farm.lp_address] || 18);
        //  @ts-expect-error
        const difference = await farmFunctions[farm.id]?.withdrawSlippage({
            amountInWei,
            currentWallet,
            getClients,
            max,
            farm,
        });

        const afterDepositAmount =
            Number(toEth(difference, decimals[farm.chainId][farm.lp_address])) * prices[farm.chainId][farm.lp_address];
        const beforeDepositAmount = withdrawAmount * prices[farm.chainId][farm.lp_address];
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
        mutationKey: FARM_WITHDRAW(currentWallet!, farm?.id || 0),
    });

    const withdrawIsMutating = useIsMutating({
        mutationKey: FARM_WITHDRAW(currentWallet!, farm?.id || 0),
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
