import { AccountResponse } from "src/state/account/types";
import { backendApi } from ".";

export const postAccountData = async (address: string, referrerCode?: string) => {
    const res = await backendApi.post<{ data: AccountResponse | null }>("account", {
        address,
        referrer: referrerCode,
    });
    return res.data.data;
};

export const getAccountData = async (address: string) => {
    const {
        data: { data },
    } = await backendApi.get<{ data: AccountResponse | null }>("account/" + address);
    return data;
};

/**
 * Get referral earning of an account in USD
 */
export const getReferalEarning = async (address: string) => {
    const {
        data: {
            data: { amountInUSD },
        },
    } = await backendApi.get<{ data: { amountInUSD: number } }>("account/referral-earning/" + address);
    return amountInUSD;
};
