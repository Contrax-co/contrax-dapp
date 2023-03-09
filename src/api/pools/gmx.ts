import pools from "src/config/constants/pools.json";
import { Farm, FarmData } from "src/types";
import { constants, providers, BigNumber, Signer, Contract, utils } from "ethers";
import { approveErc20, getBalance, getPrice } from "src/api/token";
import { defaultChainId } from "src/config/constants";
import { toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, dismissNotifyAll, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { Prices } from "src/state/prices/types";
import { Balances } from "src/state/balances/types";

const farm = pools.find((farm) => farm.id === 5) as Farm;
let farmData: FarmData | undefined = undefined;

export const getFarmData = async (
    provider: MulticallProvider,
    currentWallet: string,
    _ethBalance?: BigNumber
): Promise<FarmData> => {
    const lpPrice = await getPrice(farm.lp_address, defaultChainId);
    const lpBalance = await getBalance(farm.lp_address, currentWallet, provider);
    const vaultBalance = await getBalance(farm.vault_addr, currentWallet, provider);
    farmData = {
        Max_Zap_Withdraw_Balance_Dollar: "0",
        Max_Zap_Withdraw_Balance: "0",
        Max_Token_Withdraw_Balance: toEth(vaultBalance),
        Max_Token_Withdraw_Balance_Dollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
        Max_Token_Deposit_Balance: toEth(lpBalance),
        Max_Token_Deposit_Balance_Dollar: (Number(toEth(lpBalance)) * lpPrice).toString(),
        Max_Zap_Deposit_Balance_Dollar: "0",
        Max_Zap_Deposit_Balance: "0",
        Token_Token_Symbol: farm.name,
        Zap_Token_Symbol: "",
        Token_Deposit_Token_Address: farm.lp_address,
        Token_Withdraw_Token_Address: farm.lp_address,
        Zap_Deposit_Token_Address: constants.AddressZero,
        Zap_Withdraw_Token_Address: constants.AddressZero,
        TOKEN_PRICE: lpPrice,
        ZAP_TOKEN_PRICE: 0,
        Zap_Enabled: false,
        ID: farm.id,
    };
    return farmData;
};

export const getModifiedFarmDataByEthBalance = (balances: Balances, prices: Prices) => {
    const lpPrice = prices[farm.lp_address.toLowerCase()];
    const vaultBalance = BigNumber.from(balances[farm.vault_addr.toLowerCase()].balance);
    const lpBalance = BigNumber.from(balances[farm.lp_address.toLowerCase()].balance);

    const result = {
        Max_Zap_Withdraw_Balance_Dollar: "0",
        Max_Zap_Withdraw_Balance: "0",
        Max_Token_Withdraw_Balance: toEth(vaultBalance),
        Max_Token_Withdraw_Balance_Dollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
        Max_Token_Deposit_Balance: toEth(lpBalance),
        Max_Token_Deposit_Balance_Dollar: (Number(toEth(lpBalance)) * lpPrice).toString(),
        Max_Zap_Deposit_Balance_Dollar: "0",
        Max_Zap_Deposit_Balance: "0",
        Token_Token_Symbol: farm.name,
        Zap_Token_Symbol: "",
        Token_Deposit_Token_Address: farm.lp_address,
        Token_Withdraw_Token_Address: farm.lp_address,
        Zap_Deposit_Token_Address: constants.AddressZero,
        Zap_Withdraw_Token_Address: constants.AddressZero,
        TOKEN_PRICE: lpPrice,
        ZAP_TOKEN_PRICE: 0,
        Zap_Enabled: false,
        ID: farm.id,
    };
    return result;
};

export const deposit = async ({
    depositAmount,
    currentWallet,
    signer,
    chainId,
    max,
    cb,
}: {
    depositAmount: number;
    currentWallet: string;
    signer?: Signer;
    chainId: number;
    max?: boolean;
    cb?: () => any;
}) => {
    if (!signer) return;
    let notiId = notifyLoading("Approving deposit!", "Please wait...");
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
    try {
        const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

        /*
         * Execute the actual deposit functionality from smart contract
         */
        let formattedBal;

        const lpBalance = await getBalance(farm.lp_address, currentWallet, signer.provider!);
        if (max) {
            // Deposit all
            formattedBal = lpBalance;
        } else {
            // Deposit
            formattedBal = utils.parseUnits(validateNumberDecimals(depositAmount, farm.decimals), farm.decimals);
        }

        // approve the vault to spend asset
        await approveErc20(farm.lp_address, farm.vault_addr, lpBalance, currentWallet, signer);

        dismissNotify(notiId);
        notifyLoading("Confirm Deposit!", "", { id: notiId });

        let depositTxn: any;
        if (max) {
            depositTxn = await vaultContract.depositAll();
        } else {
            depositTxn = await vaultContract.deposit(formattedBal);
        }

        dismissNotify(notiId);
        notifyLoading("Depositing...", `Txn hash: ${depositTxn.hash}`, {
            id: notiId,
            buttons: [
                {
                    name: "View",
                    // @ts-ignore
                    onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${depositTxn.hash}`, "_blank"),
                },
            ],
        });

        const depositTxnStatus = await depositTxn.wait(1);
        if (!depositTxnStatus.status) {
            throw new Error("Error depositing into vault!");
        } else {
            notifySuccess("Deposit!", "Successful");
            dismissNotify(notiId);
        }
    } catch (error: any) {
        let err = JSON.parse(JSON.stringify(error));
        dismissNotify(notiId);
        notifyError("Error!", err.reason || err.message);
    }
    cb && cb();
};

export const withdraw = async ({
    withdrawAmount,
    currentWallet,
    signer,
    chainId,
    max,
    cb,
}: {
    withdrawAmount: number;
    currentWallet: string;
    signer?: Signer;
    chainId: number;
    max?: boolean;
    cb?: () => any;
}) => {
    if (!signer) return;
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
    const notiId = notifyLoading("Approving Withdraw!", "Please wait...");
    try {
        const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

        /*
         * Execute the actual withdraw functionality from smart contract
         */
        let formattedBal;
        formattedBal = utils.parseUnits(validateNumberDecimals(withdrawAmount, farm.decimals), farm.decimals);
        dismissNotify(notiId);
        notifyLoading("Confirming Withdraw!", "Please wait...", { id: notiId });

        let withdrawTxn: any;
        if (max) {
            withdrawTxn = await vaultContract.withdrawAll();
        } else {
            withdrawTxn = await vaultContract.withdraw(formattedBal);
        }

        dismissNotify(notiId);
        notifyLoading("Withdrawing...", `Txn hash: ${withdrawTxn.hash}`, {
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
            notifySuccess("Withdrawn!", `successfully`);
        }
    } catch (error) {
        let err = JSON.parse(JSON.stringify(error));
        console.log(err);
        dismissNotify(notiId);
        notifyError("Error!", err.reason || err.message);
    }
    cb && cb();
};
