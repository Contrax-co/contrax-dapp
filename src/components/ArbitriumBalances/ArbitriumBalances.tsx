import React, { useMemo } from "react";
import styles from "./ArbitriumBalances.module.scss";
import useBalances from "src/hooks/useBalances";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";

interface IProps {}

const ArbitriumBalances: React.FC<IProps> = () => {
    const { balances } = useBalances();
    const balanceofArbitrium = useMemo(() => {
        return balances[addressesByChainId[CHAIN_ID.ARBITRUM].arbitrumAddress!];
    }, [balances]);

    return Number(balanceofArbitrium) > 0 ? (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>Arbitrium Balance</p>
            <p className={styles.value}>{balanceofArbitrium}</p>
        </div>
    ) : null;
};

export default ArbitriumBalances;
