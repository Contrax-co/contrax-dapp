import { Farm } from "src/types";
import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DATA, FARM_WITHDRAW } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import { queryClient } from "src/config/reactQuery";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";
import { utils } from "ethers";
import { useDecimals } from "../useDecimals";
import { toEth } from "src/utils/common";
import usePriceOfTokens from "../usePriceOfTokens";

const useWithdraw = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

    const _withdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
        let amountInWei = utils.parseUnits(withdrawAmount.toString(), decimals[farm.lp_address]);
        await farmFunctions[farm.id].withdraw({ amountInWei, currentWallet, signer, chainId, max });
        reloadBalances();
        reloadSupplies();
    };

    const slippageWithdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
        let amountInWei = utils.parseUnits(withdrawAmount.toString(), decimals[farm.lp_address]);
        //  @ts-ignore
        const difference = await farmFunctions[farm.id]?.withdrawSlippage({
            amountInWei,
            currentWallet,
            signer,
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
        mutationKey: FARM_WITHDRAW(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const withdrawIsMutating = useIsMutating(FARM_WITHDRAW(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any withdraw function is runnning
     */
    const isLoading = useMemo(() => {
        return withdrawIsMutating > 0;
    }, [withdrawIsMutating]);

    return { isLoading, withdraw, withdrawAsync, status, slippageWithdraw };
};

export default useWithdraw;
