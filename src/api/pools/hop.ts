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
import { DynamicFarmFunctions, GetFarmDataProcessedFn, TokenAmounts, ZapInFn, ZapOutFn } from "./types";
import { addressesByChainId } from "src/config/constants/contracts";
import { Decimals } from "src/state/decimals/types";
import { defaultChainId } from "src/config/constants";

let hop = (farmId: number) => {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getModifiedFarmDataByEthBalance: GetFarmDataProcessedFn = (balances, prices, decimals) => {
        const ethPrice = prices[constants.AddressZero];
        const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
        const vaultTokenPrice = prices[farm.token1];
        const tokenBalance = BigNumber.from(balances[farm.token1]);
        const zapCurriences = farm.zap_currencies;
        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let Depositable_Amounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(balances[usdcAddress]!, decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(balances[usdcAddress]!, decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: toEth(balances[constants.AddressZero]!, 18),
                amountDollar: (Number(toEth(balances[constants.AddressZero]!, 18)) * ethPrice).toString(),
            },
        ];

        let Withdrawable_Amounts: TokenAmounts[] = [
            {
                tokenAddress: farm.pair1,
                tokenSymbol: farm.name1,
                amount: toEth(vaultBalance, farm.decimals),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
            },
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: (
                    (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice) /
                    prices[usdcAddress    ]
                ).toString(),
                amountDollar: (Number(toEth(vaultBalance, farm.decimals)) * vaultTokenPrice).toString(),
            },
        ];

        zapCurriences?.forEach((currency) => {
            const currencyBalance = BigNumber.from(balances[currency.address]);
            const currencyPrice = prices[currency.address];
            Depositable_Amounts.push({
                tokenAddress: currency.address,
                tokenSymbol: currency.symbol,
                amount: toEth(currencyBalance, decimals[currency.symbol]),
                amountDollar: (Number(toEth(currencyBalance, decimals[currency.address])) * currencyPrice).toString(),
            });
        });
        return {
            Depositable_Amounts,
            Withdrawable_Amounts,
            ID: farm.id,
        };
    };

    const zapIn: ZapInFn = async ({ amountInWei, balances, token, currentWallet, signer, chainId, max }) => {
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

    const zapOut: ZapOutFn = async ({ amountInWei, token, currentWallet, signer, chainId, max }) => {
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

    return { zapIn, zapOut, getModifiedFarmDataByEthBalance };
};

export default hop;
