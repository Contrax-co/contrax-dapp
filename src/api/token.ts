import { awaitTransaction } from "src/utils/common";
import { Contract, providers, BigNumber, Signer, constants } from "ethers";
import { Address, erc20ABI } from "wagmi";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { backendApi } from ".";

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
    contractAddress: string,
    spender: string,
    amount: BigNumber | string,
    currentWallet: string,
    signer: Signer
) => {
    const contract = new Contract(contractAddress, erc20ABI, signer);
    // check allowance
    const allowance = await contract.allowance(currentWallet, spender);
    // if allowance is lower than amount, approve
    if (BigNumber.from(amount).gt(allowance)) {
        // approve
        return await awaitTransaction(contract.approve(spender, constants.MaxUint256));
    }
    // if already approved just return status as true
    return { status: true };
};

export const checkApproval = async (
    contractAddress: string,
    spender: string,
    amount: BigNumber | string,
    currentWallet: string,
    signer: Signer | providers.Provider
) => {
    const contract = new Contract(contractAddress, erc20ABI, signer);
    // check allowance
    const allowance = await contract.allowance(currentWallet, spender);
    // if allowance is lower than amount, approve
    if (BigNumber.from(amount).gt(allowance)) {
        // approve
        return false;
    }
    // if already approved just return status as true
    return true;
};
