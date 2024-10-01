import { useCallback, useMemo } from "react";
import { useAppSelector } from "src/state";
import { useVaults } from "./useVaults";

const useTrax = () => {
    const { estimatedTraxPerDay } = useAppSelector((state) => state.account);
    const { vaults } = useVaults();

    /**
     * Will show trax apy if the vault is joined.
     *  if no trax apy available for joined vault then return undefined.
     *  if vault is not joined then return 0
     */
    const getTraxApy = useCallback(
        (vaultAddress?: string) => {
            if (!vaults.find((item) => item.vault_addr === vaultAddress)) return undefined;
            return Number(
                (
                    (estimatedTraxPerDay.find((ele) => ele.vaultAddress === vaultAddress)?.estimatedTraxPerDay || 0) *
                    365.25
                ).toFixed()
            ).toLocaleString();
        },
        [estimatedTraxPerDay, vaults]
    );

    const totalTraxApy = useMemo(
        () =>
            Number(
                (
                    (estimatedTraxPerDay?.reduce((acc, curr) => {
                        if (vaults.find((item) => item.vault_addr === curr.vaultAddress)) {
                            return acc + curr.estimatedTraxPerDay;
                        } else return acc;
                    }, 0) || 0) * 365.25
                ).toFixed()
            ),
        [estimatedTraxPerDay, vaults]
    );
    return { getTraxApy, totalTraxApy, estimatedTraxPerDay };
};

export default useTrax;
