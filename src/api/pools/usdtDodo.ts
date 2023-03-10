import pools from "src/config/constants/pools.json";
import { Farm, FarmData } from "src/types";
import { BigNumber, Signer, Contract, utils } from "ethers";
import { approveErc20, getBalance, getPrice } from "src/api/token";
import { defaultChainId } from "src/config/constants";
import { toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { Balances } from "src/state/balances/types";
import { Prices } from "src/state/prices/types";

const farm = pools.find((farm) => farm.id === 7) as Farm;
let farmData: FarmData | undefined = undefined;

export const getFarmData = async (
    provider: MulticallProvider,
    currentWallet: string,
    _ethBalance?: BigNumber
): Promise<FarmData> => {
    const tokenPrice = await getPrice(farm.token1, defaultChainId);
    const tokenBalance = await getBalance(farm.token1, currentWallet, provider);
    const vaultBalance = await getBalance(farm.vault_addr, currentWallet, provider);
    farmData = {
        Max_Zap_Withdraw_Balance_Dollar: "0",
        Max_Zap_Withdraw_Balance: "0",
        Max_Token_Withdraw_Balance: toEth(vaultBalance, farm.decimals),
        Max_Token_Withdraw_Balance_Dollar: (Number(toEth(vaultBalance, farm.decimals)) * tokenPrice).toString(),
        Max_Token_Deposit_Balance: toEth(tokenBalance, farm.decimals),
        Max_Token_Deposit_Balance_Dollar: (Number(toEth(tokenBalance, farm.decimals)) * tokenPrice).toString(),
        Max_Zap_Deposit_Balance_Dollar: "0",
        Max_Zap_Deposit_Balance: "0",
        Token_Token_Symbol: farm.name,
        Zap_Token_Symbol: "USDT",
        Token_Deposit_Token_Address: farm.lp_address,
        Token_Withdraw_Token_Address: farm.lp_address,
        Zap_Deposit_Token_Address: farm.token1,
        Zap_Withdraw_Token_Address: farm.token1,
        TOKEN_PRICE: tokenPrice,
        ZAP_TOKEN_PRICE: 0,
        Zap_Enabled: true,
        ID: farm.id,
    };
    return farmData;
};

export const getModifiedFarmDataByEthBalance = (balances: Balances, prices: Prices) : FarmData => {
    const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
    const tokenPrice = prices[farm.token1];
    const tokenBalance = BigNumber.from(balances[farm.token1]);

    return {
        Max_Zap_Withdraw_Balance_Dollar: "0",
        Max_Zap_Withdraw_Balance: "0",
        Max_Token_Withdraw_Balance: toEth(vaultBalance, farm.decimals),
        Max_Token_Withdraw_Balance_Dollar: (Number(toEth(vaultBalance, farm.decimals)) * tokenPrice).toString(),
        Max_Token_Deposit_Balance: toEth(tokenBalance, farm.decimals),
        Max_Token_Deposit_Balance_Dollar: (Number(toEth(tokenBalance, farm.decimals)) * tokenPrice).toString(),
        Max_Zap_Deposit_Balance_Dollar: "0",
        Max_Zap_Deposit_Balance: "0",
        Token_Token_Symbol: farm.name,
        Zap_Token_Symbol: "USDT",
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
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
    let notiId = notifyLoading("Approving zapping!", "Please wait...");
    try {
        let formattedBal = utils.parseUnits(depositAmount.toString(), farm.decimals);
        // If the user is trying to zap in the exact amount of ETH they have, we need to remove the gas cost from the zap amount
        if (max) {
            const balance = await getBalance(farm.token1, currentWallet, signer.provider!);
            formattedBal = balance;
        }
        await approveErc20(farm.token1, farm.zapper_addr, formattedBal, currentWallet, signer);
        let zapperTxn = await zapperContract.zapIn(farm.vault_addr, farm.token1, formattedBal);
        dismissNotify(notiId);
        notifyLoading("Zapping...", `Txn hash: ${zapperTxn.hash}`, {
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
            notifySuccess("Zapped in!", `Success`);
        }
    } catch (error: any) {
        console.log(error);
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
    const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
    const notiId = notifyLoading("Approving Withdraw!", "Please wait...");
    try {
        /*
         * Execute the actual withdraw functionality from smart contract
         */
        let formattedBal;
        formattedBal = utils.parseUnits(validateNumberDecimals(withdrawAmount), farm.decimals || 18);
        const vaultBalance = await getBalance(farm.vault_addr, currentWallet, signer.provider!);

        await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, signer);
        await approveErc20(farm.lp_address, farm.zapper_addr, vaultBalance, currentWallet, signer);

        dismissNotify(notiId);
        notifyLoading("Confirming Withdraw!", "Please wait...", { id: notiId });

        let withdrawTxn = await zapperContract.zapOut(farm.vault_addr, max ? vaultBalance : formattedBal, farm.token1);

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
        dismissNotify(notiId);
        notifyError("Error!", err.reason || err.message);
    }
    cb && cb();
};
