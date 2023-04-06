import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { constants, BigNumber, Signer, Contract, utils } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { addressesByChainId } from "src/config/constants/contracts";
import { Balances } from "src/state/balances/types";
import { Prices } from "src/state/prices/types";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    DynamicFarmFunctions,
    GetFarmDataProcessedFn,
    TokenAmounts,
    WithdrawFn,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { defaultChainId } from "src/config/constants";

let sushi: DynamicFarmFunctions = function (farmId) {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals) => {
        const ethPrice = prices[constants.AddressZero];
        const lpAddress = farm.lp_address;
        const lpPrice = prices[lpAddress];
        const vaultBalance = BigNumber.from(balances[farm.vault_addr]);
        const ethBalance = BigNumber.from(balances[constants.AddressZero]);
        const lpBalance = BigNumber.from(balances[lpAddress]);

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let Depositable_Amounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(balances[usdcAddress]!, decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(balances[usdcAddress]!, decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: toEth(balances[constants.AddressZero]!, 18),
                amountDollar: (Number(toEth(balances[constants.AddressZero]!, 18)) * ethPrice).toString(),
                price: ethPrice,
            },
            {
                tokenAddress: lpAddress,
                tokenSymbol: farm.name,
                amount: toEth(balances[lpAddress]!, decimals[lpAddress]),
                amountDollar: (Number(toEth(balances[lpAddress]!, decimals[lpAddress])) * prices[lpAddress]).toString(),
                price: prices[lpAddress],
            },
        ];

        let Withdrawable_Amounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: ((Number(toEth(vaultBalance)) * lpPrice) / prices[usdcAddress]).toString(),
                amountDollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance)) * lpPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
                price: ethPrice,
            },
            {
                tokenAddress: lpAddress,
                tokenSymbol: farm.name,
                amount: toEth(vaultBalance),
                amountDollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
                price: prices[lpAddress],
            },
        ];

        const result = {
            Depositable_Amounts,
            Withdrawable_Amounts,
            ID: farm.id,
        };
        return result;
    };

    const deposit: DepositFn = async ({ amountInWei, currentWallet, signer, chainId, max }) => {
        if (!signer) return;
        let notiId = notifyLoading(loadingMessages.approvingDeposit());
        const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
        try {
            const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

            const lpBalance = await getBalance(farm.lp_address, currentWallet, signer.provider!);

            // approve the vault to spend asset
            await approveErc20(farm.lp_address, farm.vault_addr, lpBalance, currentWallet, signer);

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmDeposit(), { id: notiId });

            let depositTxn: any;
            if (max) {
                depositTxn = await vaultContract.depositAll();
            } else {
                depositTxn = await vaultContract.deposit(amountInWei);
            }

            dismissNotify(notiId);
            notifyLoading(loadingMessages.depositing(depositTxn.hash), {
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
                notifySuccess(successMessages.deposit());
                dismissNotify(notiId);
            }
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
            dismissNotify(notiId);
            notifyError(errorMessages.generalError(err.reason || err.message));
        }
    };

    const withdraw: WithdrawFn = async ({ amountInWei, currentWallet, signer, chainId, max }) => {
        if (!signer) return;
        const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
        const notiId = notifyLoading(loadingMessages.approvingWithdraw());
        try {
            const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmingWithdraw(), { id: notiId });

            let withdrawTxn: any;
            if (max) {
                withdrawTxn = await vaultContract.withdrawAll();
            } else {
                withdrawTxn = await vaultContract.withdraw(amountInWei);
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
            let err = JSON.parse(JSON.stringify(error));
            console.log(err);
            dismissNotify(notiId);
            notifyError(errorMessages.generalError(err.reason || err.message));
        }
    };

    const zapIn: ZapInFn = async ({ amountInWei, signer, chainId, max, token, balances, currentWallet }) => {
        if (!signer) return;
        const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
        const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
        const wethAddress = addressesByChainId[chainId].wethAddress;
        let notiId = notifyLoading(loadingMessages.approvingZapping());
        try {
            // If the user is trying to zap in the exact amount of ETH they have, we need to remove the gas cost from the zap amount
            let zapperTxn: any;
            if (token === constants.AddressZero) {
                if (max) {
                    amountInWei = balances[constants.AddressZero]!;
                }
                amountInWei = BigNumber.from(amountInWei);

                //=============Gas Logic================
                const balance = BigNumber.from(balances[constants.AddressZero]);
                const gasPrice: any = await signer.getGasPrice();
                const gasLimit = await zapperContract.estimateGas.zapInETH(farm.vault_addr, 0, wethAddress, {
                    value: balance,
                });
                const gasToRemove = gasLimit.mul(gasPrice).mul(3);
                if (amountInWei.add(gasToRemove).gte(balance)) amountInWei = amountInWei.sub(gasToRemove);
                //=============Gas Logic================

                zapperTxn = await zapperContract.zapInETH(farm.vault_addr, 0, wethAddress, {
                    value: amountInWei,
                });
            } else {
                if (max) {
                    amountInWei = balances[token]!;
                }

                await approveErc20(token, farm.zapper_addr, amountInWei, currentWallet, signer);
                zapperTxn = await zapperContract.zapIn(farm.vault_addr, 0, token, amountInWei);
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

    const zapOut: ZapOutFn = async ({ amountInWei, currentWallet, signer, chainId, max, token }) => {
        if (!signer) return;
        const zapperContract = new Contract(farm.zapper_addr, farm.zapper_abi, signer);
        const wethAddress = addressesByChainId[chainId].wethAddress;
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
                withdrawTxn = await zapperContract.zapOutAndSwap(
                    farm.vault_addr,
                    max ? vaultBalance : amountInWei,
                    wethAddress,
                    0
                );
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
            notifyError(errorMessages.generalError(err.reason || err.message || err?.data?.message));
        }
    };

    return { getProcessedFarmData, deposit, withdraw, zapIn, zapOut };
};

export default sushi;
