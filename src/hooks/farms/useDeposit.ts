import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DEPOSIT } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";
import { useDecimals } from "../useDecimals";
import usePriceOfTokens from "../usePriceOfTokens";
import { toEth } from "src/utils/common";
import { parseUnits } from "viem";
import { PoolDef } from "src/config/constants/pools_json";

interface Deposit {
    depositAmount: number;
    max?: boolean;
}

const useDeposit = (farm: PoolDef) => {
    const { currentWallet, getClients } = useWallet();
    const { reloadBalances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

    const _deposit = async ({ depositAmount, max }: Deposit) => {
        if (!currentWallet) return;
        let amountInWei = parseUnits(depositAmount.toString(), decimals[farm.chainId][farm.lp_address] || 18);
        await farmFunctions[farm.id].deposit({ amountInWei, currentWallet, getClients, max });
        reloadBalances();
        reloadSupplies();
    };

    const slippageDeposit = async ({ depositAmount, max }: Deposit) => {
        if (!currentWallet) return;
        let amountInWei = parseUnits(depositAmount.toString(), decimals[farm.chainId][farm.lp_address] || 18);
        //  @ts-expect-error
        const difference = await farmFunctions[farm.id]?.depositSlippage({
            amountInWei,
            currentWallet,
            getClients,
            max,
            farm,
        });

        const afterDepositAmount =
            Number(toEth(difference, decimals[farm.chainId][farm.lp_address])) * prices[farm.chainId][farm.lp_address];
        const beforeDepositAmount = depositAmount * prices[farm.chainId][farm.lp_address];
        let slippage = (1 - afterDepositAmount / beforeDepositAmount) * 100;
        if (slippage < 0) slippage = 0;
        return { afterDepositAmount, beforeDepositAmount, slippage };
    };

    const {
        mutate: deposit,
        mutateAsync: depositAsync,
        status,
    } = useMutation({
        mutationFn: _deposit,
        mutationKey: FARM_DEPOSIT(currentWallet!, farm?.id || 0),
    });

    const depositInIsMutating = useIsMutating({
        mutationKey: FARM_DEPOSIT(currentWallet!, farm?.id || 0),
    });

    /**
     * True if any deposit function is runnning
     */
    const isLoading = useMemo(() => {
        return depositInIsMutating > 0;
    }, [depositInIsMutating]);

    return { isLoading, depositAsync, status, deposit, slippageDeposit };
};

export default useDeposit;
