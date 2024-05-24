import { useMemo } from "react";
import useBalances from "./useBalances";
import { useVaults } from "./useVaults";
import useFarms from "./farms/useFarms";
import useWallet from "./useWallet";
import { web3AuthInstance } from "src/config/walletConfig";
import { ethers } from "ethers";
import { useQuery } from "@tanstack/react-query";
import { erc20Abi, getContract } from "viem";
import { estimateGas, getBalance, getGasPrice, waitForTransactionReceipt } from "viem/actions";
import useNotify from "./useNotify";

const useVaultMigrate = () => {
    const { farms } = useFarms();
    const { web3AuthClient, currentWallet } = useWallet();
    const { notifyLoading, dismissNotify, notifySuccess, notifyError } = useNotify();
    const { data, refetch } = useQuery({
        queryKey: ["wallet", "web3auth", "balances", "vault"],
        queryFn: async () => {
            const promises = farms.map((item) =>
                getContract({
                    address: item.vault_addr,
                    abi: erc20Abi,
                    client: {
                        public: web3AuthClient!,
                    },
                }).read.balanceOf([web3AuthClient!.account!.address])
            );
            const balances = await Promise.all(promises);
            return balances;
        },
        select(data) {
            return farms.map((item, i) => ({
                vaultAddress: item.vault_addr,
                balance: data[i],
            }));
        },
        enabled: !!web3AuthClient,
        refetchInterval: 1000 * 60 * 2,
    });
    const totalVaults = useMemo(
        () =>
            data?.reduce((acc, curr) => {
                // const bal = BigInt(balances[curr.vault_addr] || 0);
                if (curr.balance > 0) return acc + 1;
                else return acc;
            }, 0),
        [data]
    );
    const migrate = async () => {
        if (!data || !currentWallet || !web3AuthClient) return;
        const id = notifyLoading("Migrating...", `Migrating 1/${totalVaults} vaults`);
        try {
            const filtered = data.filter((ele) => ele.balance > 0);
            for (let i = 0; i < filtered.length; i++) {
                const item = filtered[i];
                notifyLoading("Migrating...", `Migrating ${i + 1}/${filtered.length} vaults`, { id });
                if (item.balance > 0) {
                    const hash = await getContract({
                        address: item.vaultAddress,
                        abi: erc20Abi,
                        client: {
                            wallet: web3AuthClient,
                        },
                    }).write.transfer([currentWallet, item.balance]);
                    await waitForTransactionReceipt(web3AuthClient, {
                        hash,
                    });
                }
            }

            notifyLoading("Migrating...", `Moving eth to ${currentWallet}`, { id });
            const bal = await getBalance(web3AuthClient, { address: web3AuthClient.account.address });
            const gasLimit = await estimateGas(web3AuthClient, {
                value: bal,
                to: currentWallet,
            });
            const gasPrice = await getGasPrice(web3AuthClient);
            const gasToRemove = gasLimit * gasPrice * 2n;
            const hash = await web3AuthClient.sendTransaction({
                to: currentWallet,
                value: bal - gasToRemove,
            });
            await waitForTransactionReceipt(web3AuthClient, {
                hash,
            });
            notifySuccess("Success!", `Migrated ${totalVaults} vaults`);
        } catch (error: any) {
            console.error(error);
            notifyError("Error!", error.details || error.reason || error.shortMessage || error.message);
        }
        dismissNotify(id);
        refetch();
    };

    return { totalVaults, migrate };
};
export default useVaultMigrate;
