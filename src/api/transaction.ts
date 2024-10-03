import { Address } from "viem";
import { backendApi } from ".";

export const getWithdrawChainForFarm = async (from: Address, farmId: number) => {
    const res = await backendApi.get<{ data: number }>(`/transaction/get-withdraw-chain-for-farm/${farmId}/${from}`);
    return res.data.data;
};
