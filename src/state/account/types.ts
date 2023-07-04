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
}

export interface AccountResponse {
    _id: string;
    id: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    earnedTrax?: number;
    earnedTraxByReferral?: number;
    totalEarnedTrax?: number;
    totalEarnedTraxByReferral?: number;
    traxCalculatedTimestamp?: number;
    tvl: number;
    referralCode?: string;
    referrer?: {
        _id: string;
        address: string;
        createdAt: string;
        referralCode: string;
        id: string;
    };
}
