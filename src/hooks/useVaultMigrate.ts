import { useMemo, useState } from "react";
import useFarms from "./farms/useFarms";
import useWallet from "./useWallet";
import { useQuery } from "@tanstack/react-query";
import { Address, erc20Abi, getContract } from "viem";
import { estimateGas, getBalance, getGasPrice, waitForTransactionReceipt } from "viem/actions";
import useNotify from "./useNotify";

const useVaultMigrate = () => {
    const { farms } = useFarms();
    const { web3AuthClient, client, currentWallet } = useWallet();
    const { notifyLoading, dismissNotify, notifySuccess, notifyError } = useNotify();
    const [isLoading, setIsLoading] = useState(false);
    const tokenAddress = useMemo(() => {
        const tokenAddress = new Set<Address>();
        farms.forEach((farm) => {
            tokenAddress.add(farm.token1);
            if (farm.token2) tokenAddress.add(farm.token2);
            tokenAddress.add(farm.lp_address);
            tokenAddress.add(farm.vault_addr);
            if (farm.zap_currencies) {
                farm.zap_currencies.forEach((item) => {
                    tokenAddress.add(item.address);
                });
            }
        });
        return Array.from(tokenAddress);
    }, [farms]);

    const { data, refetch } = useQuery({
        queryKey: ["wallet", "web3auth", "balances", "vault"],
        queryFn: async () => {
            const promises = tokenAddress.map((item) =>
                getContract({
                    address: item,
                    abi: erc20Abi,
                    client: {
                        public: client.public,
                    },
                }).read.balanceOf([web3AuthClient!.account!.address])
            );
            const balances = await Promise.all(promises);
            return balances;
        },
        select(data) {
            return tokenAddress
                .map((item, i) => ({
                    tokenAddress: item,
                    balance: data[i],
                }))
                .filter((ele) => ele.balance > 0);
        },
        enabled: !!web3AuthClient,
        refetchInterval: 1000 * 60 * 2,
    });

    const migrate = async () => {
        if (!data || !currentWallet || !web3AuthClient) return;
        const id = notifyLoading("Migrating...", `Migrating 1/${data.length}`);
        setIsLoading(true);
        try {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                notifyLoading("Migrating...", `Migrating ${i + 1}/${data.length} vaults`, { id });
                if (item.balance > 0) {
                    const hash = await getContract({
                        address: item.tokenAddress,
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
            const gasToRemove = gasLimit * gasPrice * 5n;
            const hash = await web3AuthClient.sendTransaction({
                to: currentWallet,
                value: bal - gasToRemove,
            });
            await waitForTransactionReceipt(web3AuthClient, {
                hash,
            });
            notifySuccess("Success!", `Migrated All`);
        } catch (error: any) {
            console.error(error);
            notifyError("Error!", error.details || error.reason || error.shortMessage || error.message);
        }
        dismissNotify(id);
        refetch();
        setIsLoading(true);
    };

    return { migrate, data, isLoading };
};
export default useVaultMigrate;
