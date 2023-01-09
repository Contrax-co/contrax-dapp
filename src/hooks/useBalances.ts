import { useMemo } from "react";
import useVaults from "src/hooks/vaults/useVaults";
import { Multicall, ContractCallResults, ContractCallContext } from "ethereum-multicall";
import useWallet from "src/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_BALANCES } from "src/config/constants/query";
import * as ethers from "ethers";
import useConstants from "./useConstants";
import erc20 from "src/assets/abis/erc20.json";

/**
 * @description Returns balances for all tokens
 */
const useBalances = (data: { address: string; decimals: number }[]) => {
    const { NETWORK_NAME } = useConstants();
    const { provider, currentWallet } = useWallet();

    const getAllBalances = async () => {
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
        Object.entries(results.results).forEach(([key, value]) => {
            ans[key] = ethers.BigNumber.from(value.callsReturnContext[0].returnValues[0].hex);
        });
        return ans;
    };

    const {
        data: balances,
        refetch,
        isLoading,
        isFetching,
    } = useQuery(
        TOKEN_BALANCES(
            currentWallet,
            data.map((_) => _.address),
            NETWORK_NAME
        ),
        getAllBalances,
        {
            enabled: !!provider && !!currentWallet && data.length > 0 && !!NETWORK_NAME,
            initialData: {},
        }
    );

    const formattedBalances = useMemo(() => {
        let b: { [key: string]: number } = {};
        Object.entries(balances).map(([key, value]) => {
            // Find decimals for each vault
            const decimals = data.find((_) => _.address.toLowerCase() === key.toLowerCase())?.decimals;

            // Formalize the balance
            const formattedBal = Number(ethers.utils.formatUnits(value, decimals));
            b[key] = formattedBal;
        });
        return b;
    }, [balances]);

    return { balances, formattedBalances, refetch, isLoading, isFetching };
};

export default useBalances;
