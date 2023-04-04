import pools from "src/config/constants/pools";
import { Farm } from "src/types";
import { BigNumber, Signer, Contract, utils, constants } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { Balances } from "src/state/balances/types";
import { Prices } from "src/state/prices/types";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import { DepositFn, GetFarmDataProcessedFn, WithdrawFn, ZapInFn, ZapOutFn } from "./types";
import { addressesByChainId } from "src/config/constants/contracts";

const farm = pools.find((farm) => farm.id === 16) as Farm;

export const getModifiedFarmDataByEthBalance: GetFarmDataProcessedFn = (balances: Balances, prices: Prices) => {
    const ethBalance = balances[constants.AddressZero]!;
    const ethPrice = prices[constants.AddressZero];
    const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
    const tokenPrice = prices[farm.token1];
    const tokenBalance = BigNumber.from(balances[farm.token1]);

    return {
        Max_Zap_Withdraw_Balance_Dollar: "0",
        Max_Zap_Withdraw_Balance: "0",
        Max_Token_Withdraw_Balance: toEth(vaultBalance, farm.decimals),
        Max_Token_Withdraw_Balance_Dollar: (Number(toEth(vaultBalance, farm.decimals)) * ethPrice).toString(),
        Max_Token_Deposit_Balance: toEth(ethBalance, 18),
        Max_Token_Deposit_Balance_Dollar: (Number(toEth(ethBalance, 18)) * ethPrice).toString(),
        Max_Zap_Deposit_Balance_Dollar: "0",
        Max_Zap_Deposit_Balance: "0",
        Token_Token_Symbol: "",
        Zap_Token_Symbol: "",
        Token_Deposit_Token_Address: farm.lp_address,
        Token_Withdraw_Token_Address: farm.lp_address,
        Zap_Deposit_Token_Address: farm.token1,
        Zap_Withdraw_Token_Address: farm.token1,
        TOKEN_PRICE: tokenPrice,
        ZAP_TOKEN_PRICE: 0,
        Zap_Enabled: true,
        ID: farm.id,
    };
};

export const zapIn: ZapInFn = async ({ amountInWei, balances, token, signer, chainId, currentWallet, max }) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
    let notiId = notifyLoading(loadingMessages.approvingZapping());
    try {
        let zapperTxn: any;
        if (token === constants.AddressZero) {
            if (max) {
                amountInWei = balances[constants.AddressZero]!;
            }
            await approveErc20(
                addressesByChainId[chainId].wethAddress,
                farm.zapper_addr,
                amountInWei,
                currentWallet,
                signer
            );
            zapperTxn = await zapperContract.zapInETH(farm.vault_addr, 0, farm.token1, { value: amountInWei });
        } else {
            if (max) {
                amountInWei = balances[token]!;
            }
            await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, signer);
            zapperTxn = await zapperContract.zapIn(farm.vault_addr, 0, farm.token1, amountInWei);
        }

        dismissNotify(notiId);
        notifyLoading(loadingMessages.zapping(zapperTxn.hash), {
            id: notiId,
            buttons: [
                {
                    name: "View",
                    // @ts-ignore
                    onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${zapperTxn.hash}`, "_blank"),
                },
            ],
        });

        const zapperTxnStatus = await zapperTxn.wait(1);
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

export const zapOut: ZapOutFn = async ({ amountInWei, currentWallet, signer, chainId, token, max }) => {
    if (!signer) return;
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const notiId = notifyLoading(loadingMessages.approvingWithdraw());
    try {
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, signer.provider!);

        await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, signer);
        await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, signer);

        dismissNotify(notiId);
        notifyLoading(loadingMessages.confirmingWithdraw(), { id: notiId });
        let withdrawTxn: any;
        if (max) {
            amountInWei = vaultBalance;
        }
        if (token === constants.AddressZero) {
            withdrawTxn = await zapperContract.zapOut(farm.vault_addr, max ? vaultBalance : amountInWei);
        } else {
            withdrawTxn = await zapperContract.zapOutAndSwap(
                farm.vault_addr,
                max ? vaultBalance : amountInWei,
                token,
                0
            );
        }

        dismissNotify(notiId);
        notifyLoading(loadingMessages.withDrawing(withdrawTxn.hash), {
            id: notiId,
            buttons: [
                {
                    name: "View",
                    // @ts-ignore
                    onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${withdrawTxn.hash}`, "_blank"),
                },
            ],
        });

        const withdrawTxnStatus = await withdrawTxn.wait(1);
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
