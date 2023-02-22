import { useEffect, useMemo } from "react";
import { Multicall, ContractCallResults, ContractCallContext } from "ethereum-multicall";
import useWallet from "src/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_TOTAL_SUPPLIES } from "src/config/constants/query";
import * as ethers from "ethers";
import useConstants from "src/hooks/useConstants";
import erc20 from "src/assets/abis/erc20.json";
import { isValidNetwork } from "src/utils/common";

/**
 * Returns total supply for all tokens
 */
const useTotalSupplies = (data: { address: string; decimals: number }[]) => {
    const { NETWORK_NAME } = useConstants();
    const { provider } = useWallet();

    const getAllSupplies = async () => {
        if (!provider || !isValidNetwork(NETWORK_NAME)) return {};

        const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });
        const contractCallContext: ContractCallContext[] = [];

        // Create Call context with addresses of all vaults with balanceOf method
        data.forEach((item) => {
            const callContext: ContractCallContext = {
                reference: item.address,
                contractAddress: item.address,
                abi: erc20.abi,
                calls: [{ reference: "supply", methodName: "totalSupply", methodParameters: [] }],
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

    const placeholderData = useMemo(() => {
        let b: { [key: string]: ethers.BigNumber } = {};
        data.forEach((item) => {
            b[item.address] = ethers.BigNumber.from(0);
        });
        return b;
    }, [data]);

    const {
        data: suppliesUndefined,
        refetch,
        isLoading,
        isFetching,
        isPlaceholderData,
    } = useQuery(
        TOKEN_TOTAL_SUPPLIES(
            data.map((_) => _.address),
            NETWORK_NAME
        ),
        getAllSupplies,
        {
            enabled: !!provider && data.length > 0 && !!NETWORK_NAME,
            placeholderData,
        }
    );
    const supplies = suppliesUndefined!;
    const formattedSupplies = useMemo(() => {
        let b: { [key: string]: number } = {};
        Object.entries(supplies).map(([key, value]) => {
            // Find decimals for each vault
            const decimals = data.find((_) => _.address.toLowerCase() === key.toLowerCase())?.decimals;

            // Formalize the balance
            const formattedBal = Number(ethers.utils.formatUnits(value, decimals));
            b[key] = formattedBal;
        });
        return b;
    }, [supplies]);

    return {
        /**
         * Object with address as key and supply as value in bignumber
         */
        supplies,

        /**
         * Object with address as key and supply as value in number readable format
         */
        formattedSupplies,

        /**
         * Refetch supplies, update state
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

export default useTotalSupplies;
