import React, { useMemo, useState } from "react";
import { buildTransaction, getRoute } from "src/api/bridge";
import { CHAIN_ID } from "src/types/enums";
import useWallet from "./useWallet";
import { awaitTransaction, toEth } from "src/utils/common";
import useBalances from "./useBalances";
import { approveErc20 } from "src/api/token";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { v4 as uuid } from "uuid";
import { BigNumber } from "ethers";

const usdcAddr = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const nativeUsdAddr = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

const useSwapUsdcNative = () => {
    const { currentWallet, signer } = useWallet();
    const { balances, reloadBalances } = useBalances();
    const [loading, setLoading] = useState(false);

    const initateSwap = async (swapAmount?: BigNumber) => {
        const notiId = uuid();
        setLoading(true);
        try {
            notifyLoading({ title: "Swapping", message: `Getting swap route` }, { id: notiId });
            const { approvalData, route } = await getRoute(
                CHAIN_ID.ARBITRUM,
                CHAIN_ID.ARBITRUM,
                nativeUsdAddr,
                usdcAddr,
                swapAmount ? swapAmount.toString() : balances[nativeUsdAddr]!,
                currentWallet
            );
            notifyLoading({ title: "Swapping", message: `Approving Native USDC - 1/3` }, { id: notiId });
            await approveErc20(
                approvalData.approvalTokenAddress,
                approvalData.allowanceTarget,
                approvalData.minimumApprovalAmount,
                currentWallet,
                signer!
            );
            notifyLoading({ title: "Swapping", message: "Creating transaction - 2/3" }, { id: notiId });
            const buildTx = await buildTransaction(route);
            const tx = {
                to: buildTx?.txTarget,
                data: buildTx?.txData,
                value: buildTx?.value,
                chainId: buildTx?.chainId,
            };
            notifyLoading({ title: "Swapping", message: `Sending swap transaction - 3/3` }, { id: notiId });
            const { error, status } = await awaitTransaction(signer?.sendTransaction(tx));
            if (status) {
                notifySuccess({ title: "Success!", message: "Native USDC converted to USDC" });
            } else {
                notifyError({ title: "Error!", message: error });
            }
        } catch (error: any) {
            notifyError({ title: "Error!", message: error.message });
        } finally {
            setLoading(false);
            dismissNotify(notiId);
            reloadBalances();
        }
    };

    const formattedBalance = useMemo(() => Number(toEth(balances[nativeUsdAddr] || "0", 6)), [balances]);
    return { initateSwap, formattedBalance, loading };
};

export default useSwapUsdcNative;
