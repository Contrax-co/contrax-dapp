import { useEffect, useState } from "react";
import { Farm } from "src/types";
import { toEth, toWei } from "src/utils/common";
import { useDecimals } from "./useDecimals";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import useBalances from "./useBalances";
import farmFunctions from "src/api/pools";
import { zeroAddress } from "viem";

export const useSlippageDeposit = (maxAmounts: number[], tokens: string[], farm: Farm) => {
    const [slippageAmounts, setSlippageAmounts] = useState<{ [key: string]: number }>({});
    const [loadingDeposit, setLoadingDeposit] = useState(false);
    const { decimals } = useDecimals();
    const { balances } = useBalances();
    const { prices } = usePriceOfTokens();
    const { signer, currentWallet, networkId: chainId } = useWallet();

    const fetchSlippage = async () => {
        setLoadingDeposit(true);
        const newSlippageAmounts: { [key: string]: number } = {};
        for (const maxAmount of maxAmounts) {
            for (const token of tokens) {
                let amt;
                if (token === zeroAddress) {
                    amt = maxAmount / prices[zeroAddress];
                } else {
                    amt = maxAmount;
                }
                let amountInWei = toWei(amt, decimals[token]);
                try {
                    //  @ts-ignore
                    const difference = await farmFunctions[farm.id]?.zapInSlippage({
                        currentWallet,
                        amountInWei,
                        balances,
                        signer,
                        chainId,
                        max: false,
                        token,
                        prices,
                        // @ts-ignore
                        decimals,
                    });
                    const afterDepositAmount = Number(toEth(difference, farm.decimals)) * prices[farm.vault_addr];
                    const beforeDepositAmount = amt * prices[token];
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

export const useSlippageWithdraw = (maxAmounts: number[], tokens: string[], farm: Farm) => {
    const [slippageAmounts, setSlippageAmounts] = useState<{ [key: string]: number }>({});
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const { decimals } = useDecimals();
    const { balances } = useBalances();
    const { prices } = usePriceOfTokens();
    const { signer, currentWallet, networkId: chainId } = useWallet();

    const fetchSlippage = async () => {
        setLoadingWithdraw(true);
        const newSlippageAmounts: { [key: string]: number } = {};
        for (const maxAmount of maxAmounts) {
            for (const token of tokens) {
                let amt = maxAmount / prices[farm.vault_addr];

                let amountInWei = toWei(amt, farm.decimals);
                try {
                    //  @ts-ignore
                    const difference = await farmFunctions[farm.id]?.zapOutSlippage({
                        currentWallet,
                        amountInWei,
                        balances,
                        signer,
                        chainId,
                        max: false,
                        token,
                    });
                    const afterWithdrawAmount = Number(toEth(difference, decimals[token])) * prices[token];
                    const beforeWithdrawAmount = amt * prices[farm.vault_addr];
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
