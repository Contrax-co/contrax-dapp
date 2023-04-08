import { Farm } from "src/types";
import { BigNumber, Signer, Contract, utils, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    DynamicFarmFunctions,
    GetFarmDataProcessedFn,
    TokenAmounts,
    WithdrawFn,
    ZapInBaseFn,
    ZapInFn,
    ZapOutBaseFn,
    ZapOutFn,
} from "./types";
import { addressesByChainId } from "src/config/constants/contracts";

export const zapInBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    currentWallet,
    signer,
    chainId,
    max,
}) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
    const wethAddress = addressesByChainId[chainId].wethAddress;
    let notiId = notifyLoading(loadingMessages.approvingZapping());
    try {
        if (token === constants.AddressZero) {
            token = wethAddress;

            if (max) {
                amountInWei = balances[constants.AddressZero]!;
            }
            amountInWei = BigNumber.from(amountInWei);

            //=============Gas Logic================
            const balance = BigNumber.from(balances[constants.AddressZero]);
            const gasPrice: any = await signer.getGasPrice();
            const gasLimit = await zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
                value: balance,
            });
            const gasToRemove = gasLimit.mul(gasPrice).mul(3);
            if (amountInWei.add(gasToRemove).gte(balance)) amountInWei = amountInWei.sub(gasToRemove);
            //=============Gas Logic================

            const zapperTxn = await zapperContract.zapInETH(farm.vault_addr, 0, token, {
                value: amountInWei,
            });
        } else {
            if (max) {
                amountInWei = balances[token]!;
            }
            const response = await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, signer);
            if (!response.status) throw new Error("Error approving vault!");
        }

        dismissNotify(notiId);
        notifyLoading(loadingMessages.zapping(""), {
            id: notiId,
            buttons: [
                {
                    name: "View",
                    // @ts-ignore
                    // onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${zapperTxn.hash}`, "_blank"),
                },
            ],
        });

        const zapperTxnStatus = await awaitTransaction(zapperContract.zapIn(farm.vault_addr, 0, token, amountInWei));
        if (!zapperTxnStatus.status) {
            throw new Error("Error zapping into vault!");
        } else {
            dismissNotify(notiId);
            notifySuccess(successMessages.zapIn());
        }
    } catch (error: any) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        dismissNotify(notiId);
        notifyError(errorMessages.generalError(err.reason || err.message));
    }
};

export const zapOutBase: ZapOutBaseFn = async ({ farm, amountInWei, token, currentWallet, signer, chainId, max }) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const notiId = notifyLoading(loadingMessages.approvingWithdraw());
    try {
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, signer.provider!);

        if (!(await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
            throw new Error("Error approving vault!");

        if (!(await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
            throw new Error("Error approving lp!");

        dismissNotify(notiId);
        notifyLoading(loadingMessages.confirmingWithdraw(), { id: notiId });

        dismissNotify(notiId);
        notifyLoading(loadingMessages.withDrawing(), {
            id: notiId,
            buttons: [
                {
                    name: "View",
                    // @ts-ignore
                    // onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${withdrawTxn.hash}`, "_blank"),
                },
            ],
        });

        let withdrawTxnStatus: any;
        if (max) {
            amountInWei = vaultBalance;
        }
        if (token === constants.AddressZero) {
            withdrawTxnStatus = await awaitTransaction(
                zapperContract.zapOutAndSwapEth(farm.vault_addr, max ? vaultBalance : amountInWei, 0)
            );
        } else {
            withdrawTxnStatus = await awaitTransaction(
                zapperContract.zapOutAndSwap(farm.vault_addr, max ? vaultBalance : amountInWei, token, 0)
            );
        }

        if (!withdrawTxnStatus.status) {
            throw new Error("Error withdrawing Try again!");
        } else {
            dismissNotify(notiId);
            notifySuccess(successMessages.withdraw());
        }
    } catch (error) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        dismissNotify(notiId);
        notifyError(errorMessages.generalError(err.reason || err.message));
    }
};
