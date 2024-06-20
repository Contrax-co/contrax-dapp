import React, { useMemo } from "react";
import styles from "./ArbitriumBalances.module.scss";
import useBalances from "src/hooks/useBalances";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { useAppSelector } from "src/state";

interface IProps {}

const ArbitriumBalances: React.FC<IProps> = () => {
    // const { balances } = useBalances();
    const { earnedArb, emmitedArb } = useAppSelector((state) => state.account);

    // const balanceofArbitrium = useMemo(() => {
    //     return balances[addressesByChainId[CHAIN_ID.ARBITRUM].arbitrumAddress!];
    // }, [balances]);

    return Number(earnedArb) > 0.0005 ? (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>Loyalty Arb</p>
            <p className={styles.value}>{earnedArb?.toFixed(3)}</p>
        </div>
    ) : null;
};

export default ArbitriumBalances;
