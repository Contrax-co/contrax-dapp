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
    const [loading, setLoading] = useState(false);
    const { decimals } = useDecimals();
    const { balances } = useBalances();
    const { prices } = usePriceOfTokens();
    const { signer, currentWallet, networkId: chainId } = useWallet();

    const fetchSlippage = async () => {
        setLoading(true);
        const newSlippageAmounts: { [key: string]: number } = {};
        try {
            for (const maxAmount of maxAmounts) {
                for (const token of tokens) {
                    let amt;
                    if (token === zeroAddress) {
                        amt = maxAmount / prices[zeroAddress];
                    } else {
                        amt = maxAmount;
                    }
                    let amountInWei = toWei(amt, decimals[token]);
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
                }
            }
            setSlippageAmounts(newSlippageAmounts);
        } catch (err) {
            console.log(`%cError Slippage: ${err}`);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSlippage();
    }, []);

    return { slippageAmounts, loading };
};
