import { useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import { Farm } from "src/types";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DATA, FARM_DEPOSIT } from "src/config/constants/query";
import farmFunctions from "src/api/pools";
import { queryClient } from "src/config/reactQuery";
import useBalances from "../useBalances";
import useTotalSupplies from "../useTotalSupplies";
import { utils } from "ethers";
import { useDecimals } from "../useDecimals";
import usePriceOfTokens from "../usePriceOfTokens";
import { toEth } from "src/utils/common";

interface Deposit {
    depositAmount: number;
    max?: boolean;
}

const useDeposit = (farm: Farm) => {
    const { signer, currentWallet, networkId: chainId } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { reloadBalances } = useBalances();
    const { reloadSupplies } = useTotalSupplies();
    const { decimals } = useDecimals();
    const { prices } = usePriceOfTokens();

    const _deposit = async ({ depositAmount, max }: Deposit) => {
        let amountInWei = utils.parseUnits(depositAmount.toString(), decimals[farm.lp_address]);
        await farmFunctions[farm.id].deposit({ amountInWei, currentWallet, signer, chainId, max });
        reloadBalances();
        reloadSupplies();
    };

    const slippageDeposit = async ({ depositAmount, max }: Deposit) => {
        let amountInWei = utils.parseUnits(depositAmount.toString(), decimals[farm.lp_address]);
        //  @ts-ignore
        const difference = await farmFunctions[farm.id]?.depositSlippage({
            amountInWei,
            currentWallet,
            signer,
            chainId,
            max,
            farm,
        });

        const afterDepositAmount = Number(toEth(difference, decimals[farm.lp_address])) * prices[farm.lp_address];
        const beforeDepositAmount = depositAmount * prices[farm.lp_address];
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
        mutationKey: FARM_DEPOSIT(currentWallet, NETWORK_NAME, farm?.id || 0),
    });

    const depositInIsMutating = useIsMutating(FARM_DEPOSIT(currentWallet, NETWORK_NAME, farm?.id || 0));

    /**
     * True if any deposit function is runnning
     */
    const isLoading = useMemo(() => {
        return depositInIsMutating > 0;
    }, [depositInIsMutating]);

    return { isLoading, depositAsync, status, deposit, slippageDeposit };
};

export default useDeposit;
