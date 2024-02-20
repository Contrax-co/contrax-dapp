import { useCallback, useMemo } from "react";
import { useAppSelector } from "src/state";
import { Address } from "viem";

const useTrax = () => {
    const { estimatedTraxPerDay } = useAppSelector((state) => state.account);

    const getTraxApy = useCallback(
        (vaultAddress?: string) => {
            return Number(
                (
                    (estimatedTraxPerDay.find((ele) => ele.vaultAddress === vaultAddress)?.estimatedTraxPerDay || 0) *
                    356.25
                ).toFixed()
            ).toLocaleString();
        },
        [estimatedTraxPerDay]
    );

    const totalTraxApy = useMemo(
        () =>
            Number(
                (estimatedTraxPerDay?.reduce((acc, curr) => acc + curr.estimatedTraxPerDay, 0) || 0 * 365.25).toFixed()
            ),
        [estimatedTraxPerDay]
    );
    return { getTraxApy, totalTraxApy, estimatedTraxPerDay };
};

export default useTrax;
