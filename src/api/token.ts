import { awaitTransaction } from "src/utils/common";
import { Contract, providers, BigNumber, Signer, constants } from "ethers";
import { Address, erc20ABI } from "wagmi";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { backendApi } from ".";
import { PublicClient, WalletClient, getContract, maxUint256 } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
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
    tokenAddress: string,
    address: string,
    multicallProvider: MulticallProvider | providers.Provider | Signer
): Promise<BigNumber> => {
    try {
        if (tokenAddress === constants.AddressZero) {
            // @ts-ignore
            if (multicallProvider._isSigner) {
                // @ts-ignore
                const res = await multicallProvider.getBalance();
                return res;
            } else {
                const res = await multicallProvider.getBalance(address);
                return res;
            }
        }
        const contract = new Contract(
            tokenAddress,
            ["function balanceOf(address) view returns (uint)"],
            multicallProvider
        );
        const balancePromise = contract.balanceOf(address);
        const balance = await balancePromise;
        return balance;
    } catch (error) {
        console.error(error);
        return BigNumber.from(0);
    }
};

export const approveErc20 = async (
    contractAddress: Address,
    spender: Address,
    amount: bigint,
    currentWallet: Address,
    client: IClients
) => {
    const contract = getContract({
        abi: erc20ABI,
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
        abi: erc20ABI,
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
