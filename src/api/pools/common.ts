import { Farm } from "src/types";
import { BigNumber, Signer, Contract, utils, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import {
    awaitTransaction,
    getConnectorId,
    isZeroDevSigner,
    subtractGas,
    toEth,
    validateNumberDecimals,
} from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    DynamicFarmFunctions,
    GetFarmDataProcessedFn,
    TokenAmounts,
    WithdrawFn,
    ZapInArgs,
    ZapInBaseFn,
    ZapInFn,
    ZapOutBaseFn,
    ZapOutFn,
} from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { defaultChainId, web3AuthConnectorId } from "src/config/constants";
import { backendApi, isGasSponsored } from "..";
import { TenderlySimulateTransactionBody } from "src/types/tenderly";
import { filterStateDiff, getAllowanceStateOverride, simulateTransaction } from "../tenderly";

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
            if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
                const balance = BigNumber.from(balances[constants.AddressZero]);
                if (
                    !(await subtractGas(
                        amountInWei,
                        signer,
                        zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
                            value: balance,
                        })
                    ))
                ) {
                    notiId && dismissNotify(notiId);
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
            const tx = zapperContract.populateTransaction.zapIn(farm.vault_addr, 0, token, amountInWei);

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

// TODO: move to tenderly and work in progress

export const slippageIn = async (args: ZapInArgs & { farm: Farm }) => {
    let { amountInWei, balances, chainId, currentWallet, token, max, signer, tokenIn, farm } = args;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const wethAddress = addressesByChainId[chainId].wethAddress;

    const transaction = {} as Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >;
    transaction.from = currentWallet;

    if (max) {
        amountInWei = balances[token] ?? "0";
    }
    amountInWei = BigNumber.from(amountInWei);
    if (token !== constants.AddressZero) {
        transaction.state_overrides = getAllowanceStateOverride([
            {
                tokenAddress: token,
                owner: currentWallet,
                spender: farm.zapper_addr,
            },
        ]);
    }

    if (token === constants.AddressZero) {
        // use weth address as tokenId, but in case of some farms (e.g: hop)
        // we need the token of liquidity pair, so use tokenIn if provided
        token = tokenIn ?? wethAddress;

        //#region Gas Logic
        // if we are using zero dev, don't bother
        const connectorId = getConnectorId();
        if (connectorId !== web3AuthConnectorId || !(await isGasSponsored(currentWallet))) {
            const balance = BigNumber.from(balances[constants.AddressZero]);
            await subtractGas(
                amountInWei,
                signer!,
                zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, token, {
                    value: balance,
                })
            );
        }
        //#endregion

        zapperContract.populateTransaction.zapInETH(farm.vault_addr, 0, token, {
            value: amountInWei,
        });
    }

    const simulationResult = await simulateTransaction({
        /* Standard EVM Transaction object */
        from: currentWallet,
        to: "0x80957FaBaC43427639a875A44156fbE35081c7f9",
        input: "0x72f8b6cd000000000000000000000000fd3573bebdc8bf323c65edf2408fd9a8412a86940000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8000000000000000000000000000000000000000000000000000000000020319d",

        state_overrides: getAllowanceStateOverride([
            {
                tokenAddress: addressesByChainId[defaultChainId].usdcAddress,
                owner: "0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8",
                spender: "0x80957FaBaC43427639a875A44156fbE35081c7f9",
            },
        ]),
    });

    const filteredState = filterStateDiff(
        "0xfd3573bebDc8bF323c65Edf2408Fd9a8412a8694",
        "_balances",
        simulationResult.stateDiffs
    );
};
