import { UserVVL } from "src/types";

export interface StateInterface {
    /** Code of person whose link used to come on site  */
    referrerCode?: string;
    /** Ref Code of person who refered user  */
    referrerAddress?: string;
    /** Ref Code of current user  */
    referralCode?: string;
    referralEarning?: number;
    earnedTrax?: number;
    earnedTraxByReferral?: number;
    totalEarnedTrax?: number;
    totalEarnedTraxByReferral?: number;
    traxCalculatedTimestamp?: number;
    earnTraxTermsAgreed?: boolean;
    earnedArb?: number;
    emmitedArb?: number;
    boosts?: Boosts[];
    estimatedTraxPerDay: { vaultAddress: string; estimatedTraxPerDay: number }[];
}

export interface AccountResponse {
    _id: string;
    id: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    earnTraxTermsAgreed?: boolean;
    earnedTrax?: number;
    earnedTraxByReferral?: number;
    earnedArb?: number;
    emmitedArb?: number;
    totalEarnedTrax?: number;
    totalEarnedTraxByReferral?: number;
    traxCalculatedTimestamp?: number;
    tvl: number;
    referralCode?: string;
    boosts: Boosts[];
    vaultTvls: UserVVL[];
    estimatedTraxPerDay: { vaultAddress: string; estimatedTraxPerDay: number }[];
    referrer?: {
        _id: string;
        address: string;
        createdAt: string;
        referralCode: string;
        id: string;
    };
}

export enum Boosts {
    xSNOB = "xSNOB",
}
