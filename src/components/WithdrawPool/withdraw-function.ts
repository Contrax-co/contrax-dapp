import * as ethers from "ethers";
export const wethAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

/**
 * Retrieves the user's vault balance
 * @param pool
 * @param currentWallet
 * @param setUserVaultBalance
 */
export const getUserVaultBalance = async (pool: any, currentWallet: any, setUserVaultBalance: any) => {
    if (currentWallet) {
        const { ethereum } = window;
        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const vaultContract = new ethers.Contract(pool.vault_addr, pool.vault_abi, signer);

                const balance = await vaultContract.balanceOf(currentWallet);
                const formattedBal = Number(ethers.utils.formatUnits(balance, pool.decimals));

                setUserVaultBalance(formattedBal);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        setUserVaultBalance(0);
    }
};

/**
 * Withdraws lp from the vault to user
 * @param pool
 * @param withdrawAmount
 * @param setWithdrawAmount
 * @param setLoading
 * @param setLoaderMessage
 */
export const withdraw = async (
    currentWallet: any,
    setSuccess: any,
    setSecondaryMessage: any,
    pool: any,
    withdrawAmount: any,
    setWithdrawAmount: any,
    setLoading: any,
    setLoaderMessage: any,
    setLink: any,
    setHash: any
) => {
    const { ethereum } = window;
    setSuccess("loading");
    setLoading(true);
    setLoaderMessage("Withdraw initiated!");
    try {
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const vaultContract = new ethers.Contract(pool.vault_addr, pool.vault_abi, signer);

            const gasPrice1: any = await provider.getGasPrice();

            setSecondaryMessage("Approving withdraw...");

            /*
             * Execute the actual withdraw functionality from smart contract
             */
            let formattedBal;
            if (pool.decimals !== 18) {
                formattedBal = ethers.utils.parseUnits(withdrawAmount.toString(), pool.decimals);
            } else {
                formattedBal = ethers.utils.parseUnits(Number(withdrawAmount).toFixed(16), pool.decimals);
            }

            setSecondaryMessage("Confirm withdraw...");

            let withdrawTxn;
            try {
                const gasEstimated: any = await vaultContract.estimateGas.withdraw(formattedBal);
                const gasMargin = gasEstimated * 1.1;

                withdrawTxn = await vaultContract.withdraw(formattedBal, { gasLimit: Math.ceil(gasMargin) });
            } catch {
                withdrawTxn = await vaultContract.withdraw(formattedBal, {
                    gasLimit: gasPrice1 / 20,
                });
            }

            setLoaderMessage(`Withdrawing... `);
            setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);

            const withdrawTxnStatus = await withdrawTxn.wait(1);
            if (!withdrawTxnStatus.status) {
                setLink(true);
                setHash(withdrawTxn.hash);
                setLoaderMessage(`Error withdrawing from vault!`);
                setSecondaryMessage(`Try again!`);
                setSuccess("fail");
            } else {
                setLink(true);
                setHash(withdrawTxn.hash);
                setSuccess("success");
                setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);
                setLoaderMessage(`Withdrawn--`);
                setWithdrawAmount(0.0);
                // getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
            }
        } else {
            console.log("Ethereum object doesn't exist!");

            setLoaderMessage(`Error withdrawing!`);
            setSecondaryMessage(`Try again!`);
            setSuccess("fail");
        }
    } catch (error) {
        let code = JSON.stringify(error);
        let reason = JSON.parse(code);
        console.log(reason);
        if (reason["code"] === "ACTION_REJECTED") {
            setLoaderMessage(`REJECTED!`);
            setSecondaryMessage(`User rejected transaction!`);
        } else {
            setLoaderMessage(`Error withdrawing!`);
            setSecondaryMessage(`Try again!`);
        }
        setSuccess("fail");
    }
};

/**
 * Withdraws lp from the vault to user
 * @param pool
 * @param withdrawAmount
 * @param setWithdrawAmount
 * @param setLoading
 * @param setLoaderMessage
 */
export const withdrawAll = async (
    currentWallet: any,
    setSuccess: any,
    setSecondaryMessage: any,
    pool: any,
    setWithdrawAmount: any,
    setLoading: any,
    setLoaderMessage: any,
    setLink: any,
    setHash: any
) => {
    const { ethereum } = window;
    setSuccess("loading");
    setLoading(true);
    setLoaderMessage("Withdraw initiated!");
    try {
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const vaultContract = new ethers.Contract(pool.vault_addr, pool.vault_abi, signer);

            const gasPrice1: any = await provider.getGasPrice();

            setSecondaryMessage("Approving withdraw...");

            /*
             * Execute the actual withdraw functionality from smart contract
             */
            setSecondaryMessage("Confirm withdraw...");

            let withdrawTxn;
            try {
                const gasEstimated: any = await vaultContract.estimateGas.withdrawAll();
                const gasMargin = gasEstimated * 1.1;

                withdrawTxn = await vaultContract.withdrawAll({ gasLimit: Math.ceil(gasMargin) });
            } catch {
                withdrawTxn = await vaultContract.withdrawAll({
                    gasLimit: gasPrice1 / 20,
                });
            }

            setLoaderMessage(`Withdrawing... `);
            setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);

            const withdrawTxnStatus = await withdrawTxn.wait(1);
            if (!withdrawTxnStatus.status) {
                setLink(true);
                setHash(withdrawTxn.hash);
                setLoaderMessage(`Error withdrawing from vault!`);
                setSecondaryMessage(`Try again!`);
                setSuccess("fail");
            } else {
                setLink(true);
                setHash(withdrawTxn.hash);
                setSuccess("success");
                setSecondaryMessage(`Txn hash: ${withdrawTxn.hash}`);
                setLoaderMessage(`Withdrawn--`);
                setWithdrawAmount(0.0);
                // getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
            }
        } else {
            console.log("Ethereum object doesn't exist!");

            setLoaderMessage(`Error withdrawing!`);
            setSecondaryMessage(`Try again!`);
            setSuccess("fail");
        }
    } catch (error) {
        let code = JSON.stringify(error);
        let reason = JSON.parse(code);
        console.log(reason);
        if (reason["code"] === "ACTION_REJECTED") {
            setLoaderMessage(`REJECTED!`);
            setSecondaryMessage(`User rejected transaction!`);
        } else {
            setLoaderMessage(`Error withdrawing!`);
            setSecondaryMessage(`Try again!`);
        }
        setSuccess("fail");
    }
};
