import { useEffect, useState } from "react";
import { toEth, toWei } from "src/utils/common";
import { useDecimals } from "./useDecimals";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import useBalances from "./useBalances";
import farmFunctions from "src/api/pools";
import { Address, zeroAddress } from "viem";
import { PoolDef } from "src/config/constants/pools_json";
import { v4 as uuid } from "uuid";

export const useSlippageDeposit = (maxAmounts: number[], tokens: Address[], farm: PoolDef) => {
    const [slippageAmounts, setSlippageAmounts] = useState<{ [key: string]: number }>({});
    const [loadingDeposit, setLoadingDeposit] = useState(false);
    const { decimals } = useDecimals();
    const { balances } = useBalances();
    const { prices } = usePriceOfTokens();
    const { currentWallet, getClients, estimateTxGas, getPublicClient, getWalletClient, isSocial } = useWallet();

    const fetchSlippage = async () => {
        setLoadingDeposit(true);
        const newSlippageAmounts: { [key: string]: number } = {};
        for (const maxAmount of maxAmounts) {
            for (const token of tokens) {
                let amt;
                if (token === zeroAddress) {
                    amt = maxAmount / prices[farm.chainId][zeroAddress];
                } else {
                    amt = maxAmount;
                }
                let amountInWei = toWei(amt, decimals[farm.chainId][token]);
                const id = uuid();

                try {
                    const { receviedAmt: difference } = await farmFunctions[farm.id]?.zapInSlippage?.(
                        {
                            id,
                            currentWallet: currentWallet!,
                            amountInWei,
                            balances,
                            max: false,
                            isSocial,
                            token,
                            prices,
                            estimateTxGas,
                            getPublicClient,
                            getWalletClient,
                            decimals: decimals as any,
                            farm,
                            getClients,
                        }!
                    )!;
                    const afterDepositAmount =
                        Number(toEth(difference, farm.decimals)) * prices[farm.chainId][farm.vault_addr];
                    const beforeDepositAmount = amt * prices[farm.chainId][token];
                    let slippage = (1 - afterDepositAmount / beforeDepositAmount) * 100;
                    if (slippage < 0) slippage = 0;
                    newSlippageAmounts[`${maxAmount}-${token}`] = slippage;
                } catch (err) {
                    console.log(`%cError Slippage: ${err}`);
                }
            }
        }
        setSlippageAmounts(newSlippageAmounts);
        setLoadingDeposit(false);
    };

    useEffect(() => {
        fetchSlippage();
    }, []);

    return { slippageAmounts, loadingDeposit };
};

export const useSlippageWithdraw = (maxAmounts: number[], tokens: Address[], farm: PoolDef) => {
    const [slippageAmounts, setSlippageAmounts] = useState<{ [key: string]: number }>({});
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const { decimals } = useDecimals();
    const { balances } = useBalances();
    const { prices } = usePriceOfTokens();
    const { currentWallet, getClients, estimateTxGas, getPublicClient, getWalletClient, isSocial } = useWallet();

    const fetchSlippage = async () => {
        setLoadingWithdraw(true);
        const newSlippageAmounts: { [key: string]: number } = {};
        for (const maxAmount of maxAmounts) {
            for (const token of tokens) {
                let amt = maxAmount / prices[farm.chainId][farm.vault_addr];

                let amountInWei = toWei(amt, farm.decimals);
                const id = uuid();

                try {
                    const { receviedAmt: difference } = await farmFunctions[farm.id]?.zapOutSlippage?.({
                        id,
                        currentWallet: currentWallet!,
                        amountInWei,
                        isSocial,
                        balances,
                        max: false,
                        estimateTxGas,
                        getPublicClient,
                        getWalletClient,
                        token,
                        farm,
                        getClients,
                    })!;
                    const afterWithdrawAmount =
                        Number(toEth(difference, decimals[farm.chainId][token])) * prices[farm.chainId][token];
                    const beforeWithdrawAmount = amt * prices[farm.chainId][farm.vault_addr];
                    let slippage = (1 - afterWithdrawAmount / beforeWithdrawAmount) * 100;
                    if (slippage < 0) slippage = 0;

                    newSlippageAmounts[`${maxAmount}-${token}`] = slippage;
                } catch (err) {
                    console.log(`%cError Slippage: ${err}`);
                }
            }
        }
        setSlippageAmounts(newSlippageAmounts);
        setLoadingWithdraw(false);
    };

    useEffect(() => {
        fetchSlippage();
    }, []);

    return { slippageAmounts, loadingWithdraw };
};
