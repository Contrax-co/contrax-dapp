import { useMemo, useState } from "react";
import useFarms from "./farms/useFarms";
import useWallet from "./useWallet";
import { Address, erc20Abi, getContract, zeroAddress } from "viem";
import { estimateGas, getBalance, getGasPrice, waitForTransactionReceipt } from "viem/actions";
import useNotify from "./useNotify";
import useWeb3Auth from "./useWeb3Auth";

const useVaultMigrate = () => {
    const { farms } = useFarms();
    const { connect, disconnect, connected } = useWeb3Auth();
    const { client, currentWallet } = useWallet();
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

    const migrate = async () => {
        if (!currentWallet) {
            alert("Login first!");
            return;
        }
        const _walletClient = await connect();
        if (!_walletClient) return;
        setIsLoading(true);
        let id = "";
        try {
            const promises = tokenAddress.map((item) =>
                getContract({
                    address: item,
                    abi: erc20Abi,
                    client: {
                        public: client.public,
                    },
                }).read.balanceOf([_walletClient!.account!.address])
            );
            const balances = await Promise.all(promises);
            const ethBal = await client.public.getBalance({ address: _walletClient!.account!.address });
            const data = tokenAddress
                .map((item, i) => ({
                    tokenAddress: item,
                    balance: balances[i],
                }))
                .concat([{ tokenAddress: zeroAddress, balance: ethBal }])
                .filter((ele) => ele.balance > 0);

            id = notifyLoading("Migrating...", `Migrating 1/${data.length}`);
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (item.tokenAddress === zeroAddress) continue;
                notifyLoading("Migrating...", `Migrating ${i + 1}/${data.length}`, { id });
                if (item.balance > 0) {
                    const hash = await getContract({
                        address: item.tokenAddress,
                        abi: erc20Abi,
                        client: {
                            wallet: _walletClient,
                        },
                    }).write.transfer([currentWallet, item.balance]);
                    await waitForTransactionReceipt(_walletClient, {
                        hash,
                    });
                }
            }

            notifyLoading("Migrating...", `Moving eth to ${currentWallet}`, { id });
            const bal = await getBalance(_walletClient, { address: _walletClient.account.address });
            const gasLimit = await estimateGas(_walletClient, {
                value: bal,
                to: currentWallet,
            });
            const gasPrice = await getGasPrice(_walletClient);
            const gasToRemove = gasLimit * gasPrice * 6n;

            const hash = await _walletClient.sendTransaction({
                to: currentWallet,
                value: bal - gasToRemove,
            });
            await waitForTransactionReceipt(_walletClient, {
                hash,
            });
            notifySuccess("Success!", `Migrated All`);
        } catch (error: any) {
            console.error(error);
            notifyError("Error!", error.details || error.reason || error.shortMessage || error.message);
        }
        dismissNotify(id);
        setIsLoading(true);
    };
console.log("connected =>", connected);
return { migrate, isLoading, disconnect, connected };
};
export default useVaultMigrate;
