export interface StateInterface {
    /** Code of person whose link used to come on site  */
    referrerCode?: string;
    /** Ref Code of person who refered user  */
    referrerAddress?: string;
    /** Ref Code of current user  */
    referralCode?: string;
}

export interface AccountResponse {
    address: string;
    createdAt: string;
    id: string;
    referralCode?: string;
    updatedAt: string;
    _id: string;
    referrer?: {
        _id: string;
        address: string;
        createdAt: string;
        referralCode: string;
        id: string;
    };
}
