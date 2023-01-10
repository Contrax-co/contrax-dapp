import { useState, useMemo } from "react";
import useConstants from "../useConstants";
import useWallet from "../useWallet";
import * as ethers from "ethers";
import { Farm } from "src/types";
import useBalances from "../useBalances";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_DEPOSIT } from "src/config/constants/query";

const useDeposit = (farm: Farm) => {
    const { provider, signer, currentWallet } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const [hash, setHash] = useState("");

    const { formattedBalances, refetch: refetchBalances } = useBalances([
        { address: farm.lp_address, decimals: farm.decimals },
    ]);
    const lpUserBal = useMemo(() => formattedBalances[0] || 0, [formattedBalances]);

    const _deposit = async ({ depositAmount }: { depositAmount: number }) => {
        if (!provider) return;
        const vaultContract = new ethers.Contract(farm.vault_addr, farm.vault_abi, signer);

        const gasPrice1: any = await provider.getGasPrice();
        /*
         * Execute the actual deposit functionality from smart contract
         */
        let formattedBal;
        if (farm.decimals !== 18) {
            formattedBal = ethers.utils.parseUnits(depositAmount.toString(), farm.decimals);
        } else {
            if (depositAmount === lpUserBal) {
                // Deposit all
                formattedBal = ethers.utils.parseUnits(
                    Number(Number(depositAmount) + Number(depositAmount)).toFixed(16),
                    farm.decimals
                );
            } else {
                // Deposit
                formattedBal = ethers.utils.parseUnits(Number(depositAmount).toFixed(16), farm.decimals);
            }
        }

        // approve the vault to spend asset
        const lpContract = new ethers.Contract(farm.lp_address, farm.lp_abi, signer);
        await lpContract.approve(farm.vault_addr, formattedBal);

        let depositTxn;
        try {
            if (depositAmount === lpUserBal) {
                const gasEstimated: any = await vaultContract.estimateGas.depositAll();
                const gasMargin = gasEstimated * 1.1;

                depositTxn = await vaultContract.depositAll({ gasLimit: Math.ceil(gasMargin) });
            } else {
                const gasEstimated: any = await vaultContract.estimateGas.deposit(formattedBal);
                const gasMargin = gasEstimated * 1.1;

                depositTxn = await vaultContract.deposit(formattedBal, { gasLimit: Math.ceil(gasMargin) });
            }
        } catch {
            if (depositAmount === lpUserBal) {
                //the abi of the vault contract needs to be checked
                depositTxn = await vaultContract.depositAll({
                    gasLimit: gasPrice1 / 20,
                });
            } else {
                //the abi of the vault contract needs to be checked
                depositTxn = await vaultContract.deposit(formattedBal, { gasLimit: gasPrice1 / 20 });
            }
        }

        setHash(depositTxn.hash);

        const depositTxnStatus = await depositTxn.wait(1);
        if (!depositTxnStatus.status) {
            throw new Error("Error depositing into vault!");
        } else {
            refetchBalances();
        }
    };

    const {
        mutate: deposit,
        mutateAsync: depositAsync,
        error: depositError,
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

    const loaderMsg = useMemo(() => {
        if (isLoading) {
            return "Depositing in....";
        } else if (depositError) {
            return "Error Depositing in!";
        } else if (status === "success") {
            return "Deposited--";
        } else {
            return "";
        }
    }, [isLoading, status, depositError]);

    const secondaryMsg = useMemo(() => {
        if (depositError) {
            return "Try again!";
        } else if (isLoading && !hash) {
            return "Depositing in vault...";
        } else if (hash) {
            return `Txn hash: ${hash}`;
        } else {
            return "";
        }
    }, [depositError, isLoading, hash]);

    return { isLoading, depositAsync, hash, loaderMsg, secondaryMsg, status, depositError, deposit };
};

export default useDeposit;
