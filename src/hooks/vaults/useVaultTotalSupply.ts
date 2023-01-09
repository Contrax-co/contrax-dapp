import { useMemo } from "react";
import useVaults from "src/hooks/vaults/useVaults";
import { Multicall, ContractCallResults, ContractCallContext } from "ethereum-multicall";
import useWallet from "src/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { VAULT_BALANCES } from "src/config/constants/query";
import * as ethers from "ethers";
import { NETWORK_NAME } from "src/config/constants";

/**
 * @description Returns balances for all vaults
 */
const useVaultTotalSupply = () => {
    const { vaults } = useVaults();
    const { provider, currentWallet } = useWallet();

    const getAllVaultSupplies = async () => {
        const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });
        const contractCallContext: ContractCallContext[] = [];

        // Create Call context with addresses of all vaults with balanceOf method
        vaults.forEach((vault) => {
            const callContext: ContractCallContext = {
                reference: vault.vault_address,
                contractAddress: vault.vault_address,
                abi: vault.vault_abi,
                calls: [{ reference: "supply", methodName: "totalSupply", methodParameters: [currentWallet] }],
            };
            contractCallContext.push(callContext);
        });

        const results: ContractCallResults = await multicall.call(contractCallContext);
        let ans: { [key: string]: ethers.BigNumber } = {};
        Object.entries(results.results).forEach(([key, value]) => {
            ans[key] = ethers.BigNumber.from(value.callsReturnContext[0].returnValues[0].hex);
        });
        return ans;
    };

    const {
        data: supplies,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(
        VAULT_BALANCES(
            currentWallet,
            vaults.map((_) => _.vault_address),
            NETWORK_NAME
        ),
        getAllVaultSupplies,
        { enabled: !!provider && !!currentWallet && vaults.length > 0, initialData: {} }
    );

    const formattedSupplies = useMemo(() => {
        let b: { [key: string]: number } = {};
        Object.entries(supplies).map(([key, value]) => {
            // Find decimals for each vault
            const decimals = vaults.find((_) => _.vault_address.toLowerCase() === key.toLowerCase())?.decimals;

            // Formalize the balance
            const formattedBal = Number(ethers.utils.formatUnits(value, decimals));
            b[key] = formattedBal;
        });
        return b;
    }, [supplies]);

    return { supplies, formattedSupplies, refetch, isLoading, isFetching };
};

export default useVaultTotalSupply;
