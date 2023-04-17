import { Farm } from "src/types";
import { BigNumber, Signer, Contract, utils, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getConnectorId, isZeroDevSigner, toEth, validateNumberDecimals } from "src/utils/common";
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
import { web3AuthConnectorId } from "src/config/constants";

export const zapInBase: ZapInBaseFn = async ({
    farm,
    amountInWei,
    balances,
    token,
    currentWallet,
    signer,
    chainId,
    max,
    tokenIn,
}) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const wethAddress = addressesByChainId[chainId].wethAddress;
    let zapperTxn;
    let notiId;
    try {
        //#region Select Max
        if (max) {
            amountInWei = balances[token] ?? "0";
        }
        amountInWei = BigNumber.from(amountInWei);
        //#endregion

        // #region Approve
        // first approve tokens, if zap is not in eth
        if (token !== constants.AddressZero) {
            notiId = notifyLoading(loadingMessages.approvingZapping());
            const response = await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, signer);
            if (!response.status) throw new Error("Error approving vault!");
            dismissNotify(notiId);
        }
        // #endregion

        // #region Zapping In
        notiId = notifyLoading(loadingMessages.zapping());

        // eth zap
        if (token === constants.AddressZero) {
            // use weth address as tokenId, but in case of some farms (e.g: hop)
            // we need the token of liquidity pair, so use tokenIn if provided
            token = tokenIn ?? wethAddress;

            //#region Gas Logic
            // if we are using zero dev, don't bother
            const connectorId = getConnectorId();
            // if (!isZeroDevSigner(signer)) {
            if (connectorId !== web3AuthConnectorId) {
                const balance = BigNumber.from(balances[constants.AddressZero]);
                const gasPrice: any = await signer.getGasPrice();
                const gasLimit = await zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
                    value: balance,
                });
                const gasToRemove = gasLimit.mul(gasPrice).mul(3);
                if (amountInWei.add(gasToRemove).gte(balance)) amountInWei = amountInWei.sub(gasToRemove);
                if (amountInWei.lte(0)) {
                    notifyError(errorMessages.insufficientGas());
                    notiId && dismissNotify(notiId);
                    return;
                }
            }
            //#endregion

            zapperTxn = await awaitTransaction(
                zapperContract.zapInETH(farm.vault_addr, 0, token, {
                    value: amountInWei,
                })
            );
        }
        // token zap
        else {
            zapperTxn = await awaitTransaction(zapperContract.zapIn(farm.vault_addr, 0, token, amountInWei));
        }

        if (!zapperTxn.status) {
            throw new Error(zapperTxn.error);
        } else {
            dismissNotify(notiId);
            notifySuccess(successMessages.zapIn());
        }
        // #endregion
    } catch (error: any) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        notiId && dismissNotify(notiId);
        notifyError(errorMessages.generalError(error.message || err.reason || err.message));
    }
};

export const zapOutBase: ZapOutBaseFn = async ({ farm, amountInWei, token, currentWallet, signer, chainId, max }) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    let notiId = notifyLoading(loadingMessages.approvingWithdraw());
    try {
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, signer.provider!);

        //#region Approve
        if (!(await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
            throw new Error("Error approving vault!");

        if (!(await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, signer)).status)
            throw new Error("Error approving lp!");

        dismissNotify(notiId);
        //#endregion

        //#region Zapping Out
        notiId = notifyLoading(loadingMessages.withDrawing());

        let withdrawTxn;
        if (max) {
            amountInWei = vaultBalance;
        }
        if (token === constants.AddressZero) {
            withdrawTxn = await awaitTransaction(
                zapperContract.zapOutAndSwapEth(farm.vault_addr, max ? vaultBalance : amountInWei, 0)
            );
        } else {
            withdrawTxn = await awaitTransaction(
                zapperContract.zapOutAndSwap(farm.vault_addr, max ? vaultBalance : amountInWei, token, 0)
            );
        }

        if (!withdrawTxn.status) {
            throw new Error(withdrawTxn.error);
        } else {
            dismissNotify(notiId);
            notifySuccess(successMessages.withdraw());
        }
        //#endregion
    } catch (error: any) {
        console.log(error);
        let err = JSON.parse(JSON.stringify(error));
        dismissNotify(notiId);
        notifyError(errorMessages.generalError(error.message || err.reason || err.message));
    }
};
