import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import styles from "./Description.module.scss";

export const Description: React.FC<{ type: FarmTransactionType; farm: Farm; shouldUseLp: boolean }> = ({
    type,
    farm,
    shouldUseLp,
}) => {
    if (type === FarmTransactionType.Deposit && shouldUseLp)
        return (
            <div className={styles.description}>
                Deposit into the{" "}
                <a href={farm.source} className="span">
                    {farm.url_name}
                </a>{" "}
                auto-compounding liquidity pool. "Max" excludes a little ETH for gas.
            </div>
        );
    else if (type === FarmTransactionType.Deposit && !shouldUseLp)
        return (
            <div className={styles.description}>
                Deposit into the{" "}
                <a href={farm.source} className="span">
                    {farm.url_name}
                </a>{" "}
                auto-compounding liquidity pool. "Max" excludes a little ETH for gas.
            </div>
        );
    else if (type === FarmTransactionType.Withdraw && shouldUseLp)
        return (
            <div className={styles.description}>
                Withdraw from the{" "}
                <a href={farm.source} className="span">
                    {farm.url_name}
                </a>{" "}
                liquidity pool.
            </div>
        );
    else if (type === FarmTransactionType.Withdraw && !shouldUseLp)
        return (
            <div className={styles.description}>
                Withdraw from the{" "}
                <a href={farm.source} className="span">
                    {farm.url_name}
                </a>{" "}
                liquidity pool.
            </div>
        );
    return null;
};
