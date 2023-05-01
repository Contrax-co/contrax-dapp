import { useEffect, useState } from "react";
import { useAppSelector } from "src/state";

const useTVL = () => {
    const { farmDetails } = useAppSelector((state) => state.farms);
    const [tvl, setTvl] = useState(0);

    useEffect(() => {
        let totalValueLocked = 0;
        Object.values(farmDetails).forEach((e) => (totalValueLocked += Number(e.vaultBalanceFormated)));
        setTvl(totalValueLocked);
    }, [farmDetails]);

    return tvl;
};

export default useTVL;
