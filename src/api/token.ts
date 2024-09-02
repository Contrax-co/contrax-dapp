import { awaitTransaction } from "src/utils/common";
import { backendApi } from ".";
import { PublicClient, Address, erc20Abi, getContract, maxUint256, zeroAddress } from "viem";
import { IClients } from "src/types";

export const getSpecificTokenPrice = async (tokenAddress: Address, chainId: number) => {
    const res = await getTokenPricesBackend();
    if (res) {
        return res[String(chainId)][tokenAddress];
    }
    return undefined;
};

export const getTokenPricesBackend = async (
    timestamp: number | undefined = undefined,
    searchWidth: number | undefined = undefined
) => {
    try {
        const { data } = await backendApi.get<{ data: { allPrices: { [key: string]: { [key: Address]: number } } } }>(
            "price" + (timestamp ? `?timestamp=${timestamp}` : "") + (searchWidth ? `&searchWidth=${searchWidth}` : ""),
            { cache: true }
        );

        console.log("data =>", data.data.allPrices);
        return data.data.allPrices;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const getBalance = async (
    tokenAddress: Address,
    address: Address,
    client: Pick<IClients, "public">
): Promise<bigint> => {
    try {
        if (tokenAddress === zeroAddress) {
            const res = await client.public.getBalance({ address });
            return res;
        }
        const contract = getContract({
            address: tokenAddress,
            abi: erc20Abi,
            client,
        });

        const balancePromise = contract.read.balanceOf([address]);
        const balance = await balancePromise;
        return balance;
    } catch (error) {
        console.error(error);
        return 0n;
    }
};

/**
 * Checks for allowance, if not met then approves
 * @param contractAddress 
 * @param spender 
 * @param amount 
 * @param currentWallet wallet address of signer
 * @param client Both public and wallet client
 * @returns 
 */
export const approveErc20 = async (
    contractAddress: Address,
    spender: Address,
    amount: bigint,
    currentWallet: Address,
    client: IClients
) => {
    const contract = getContract({
        abi: erc20Abi,
        address: contractAddress,
        client,
    });

    // check allowance
    const allowance = await contract.read.allowance([currentWallet, spender]);
    // if allowance is lower than amount, approve
    if (amount > allowance) {
        return await awaitTransaction(contract.write.approve([spender, maxUint256]), client);
    }
    // if already approved just return status as true
    return { status: true };
};

export const checkApproval = async (
    contractAddress: Address,
    spender: Address,
    amount: bigint,
    currentWallet: Address,
    publicClient: PublicClient
) => {
    const contract = getContract({
        abi: erc20Abi,
        address: contractAddress,
        client: { public: publicClient },
    });
    // check allowance
    const allowance = await contract.read.allowance([currentWallet, spender]);

    // if allowance is lower than amount, approve
    if (amount > allowance) {
        // approve
        return false;
    }
    // if already approved just return status as true
    return true;
};
