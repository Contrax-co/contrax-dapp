import { useMemo } from "react";
import { Multicall, ContractCallResults, ContractCallContext } from "ethereum-multicall";
import useWallet from "src/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_BALANCES } from "src/config/constants/query";
import * as ethers from "ethers";
import useConstants from "./useConstants";
import erc20 from "src/assets/abis/erc20.json";

/**
 * Returns balances for all tokens
 * @param data Array of objects with address and decimals
 */
const useBalances = (data: { address: string; decimals: number }[]) => {
    const { NETWORK_NAME } = useConstants();
    const { provider, currentWallet } = useWallet();

    const getAllBalances = async () => {
        if (!provider) return {};
        const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });
        const contractCallContext: ContractCallContext[] = [];

        // Create Call context with addresses of all vaults with balanceOf method
        data.forEach((item) => {
            const callContext: ContractCallContext = {
                reference: item.address,
                contractAddress: item.address,
                abi: erc20.abi,
                calls: [{ reference: "balance", methodName: "balanceOf", methodParameters: [currentWallet] }],
            };
            contractCallContext.push(callContext);
        });

        const results: ContractCallResults = await multicall.call(contractCallContext);
        let ans: { [key: string]: ethers.BigNumber } = {};

        // Organize/format data in object form with addresses as keys and balances as values
        Object.entries(results.results).forEach(([key, value]) => {
            ans[key] = ethers.BigNumber.from(value.callsReturnContext[0].returnValues[0].hex);
        });
        return ans;
    };

    const {
        data: balancesUndefined,
        refetch,
        isLoading,
        isFetching,
        isPlaceholderData,
    } = useQuery(
        // Query will rerun and fetch new data whenever any of the values changes in below function
        TOKEN_BALANCES(
            currentWallet,
            data.map((_) => _.address),
            NETWORK_NAME
        ),
        getAllBalances,
        {
            // Will only run if all these are true:
            enabled: !!provider && !!currentWallet && data.length > 0 && !!NETWORK_NAME,

            // Initial data to be returned when no query has ran
            // Returns 0 for all the balances initially
            placeholderData: () => {
                let b: { [key: string]: ethers.BigNumber } = {};
                data.forEach((item) => {
                    b[item.address] = ethers.BigNumber.from(0);
                });
                return b;
            },
        }
    );
    const balances = balancesUndefined!;
    const formattedBalances = useMemo(() => {
        let b: { [key: string]: number } = {};
        Object.entries(balances).map(([key, value]) => {
            // Find decimals for each vault
            const decimals = data.find((_) => _.address.toLowerCase() === key.toLowerCase())?.decimals;

            // Formalize the balance
            const formattedBal = Number(ethers.utils.formatUnits(value, decimals));
            b[key] = formattedBal;
            return;
        });
        return b;
    }, [balances]);

    return {
        /**
         * Object with address as key and balance as value in bignumber
         */
        balances,

        /**
         * Object with address as key and balance as value in number readable format
         */
        formattedBalances,

        /**
         * Refetch balances, update state
         */
        refetch,

        /**
         * Is query loading, (Always returns false, if initialData is given to useQuery)
         */
        isLoading: isLoading || isPlaceholderData,

        /**
         * Is query fetching will return true if query is fetching in background
         */
        isFetching,
    };
};

export default useBalances;
