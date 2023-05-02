import { useEffect, useState } from "react";
import { FarmDataProcessed } from "src/api/pools/types";
import { useAppSelector } from "src/state";

const useTVL = () => {
    const { farmDetails } = useAppSelector((state) => state.farms);
    const [platformTVL, setPlatformTVL] = useState(0);
    const [userTVL, setUserTVL] = useState(0);

    useEffect(() => {
        let totalValueLockedPlatform = 0;
        let totalValueLockedUser = 0;
        Object.values(farmDetails).forEach((e: FarmDataProcessed) => {
            totalValueLockedPlatform += Number(e.vaultBalanceFormated);
            for (let i = 0; i < e.withdrawableAmounts.length; i++) {
                totalValueLockedUser += Number(e.withdrawableAmounts[i].amountDollar);
            }
        });
        setPlatformTVL(totalValueLockedPlatform);
        setUserTVL(totalValueLockedUser);
    }, [farmDetails]);

    return { platformTVL, userTVL };
};

export default useTVL;
