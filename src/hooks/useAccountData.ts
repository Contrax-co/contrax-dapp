import { useMemo, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useWallet from "src/hooks/useWallet";
import { useAppDispatch, useAppSelector } from "src/state";
import { addAccount, setReferrerCode } from "src/state/account/accountReducer";

const useAccountData = () => {
    const { referralCode, referrerCode } = useAppSelector((state) => state.account);
    const { currentWallet } = useWallet();
    const [params] = useSearchParams();

    useEffect(() => {
        let refCode = params.get("refCode");
        if (refCode) {
            dispatch(setReferrerCode(refCode));
        }
    }, [params]);

    const dispatch = useAppDispatch();

    const referralLink = useMemo(
        () => (referralCode ? `${window.location.origin}?refCode=${referralCode}` : undefined),
        [referralCode]
    );

    const fetchAccountData = useCallback(() => {
        dispatch(addAccount({ address: currentWallet, referrerCode }));
    }, [currentWallet, referrerCode]);

    return {
        fetchAccountData,
        referralLink,
    };
};

export default useAccountData;
