import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import styles from "./Description.module.scss";
import { useAppSelector } from "src/state";

export const Description: React.FC<{ farm: Farm }> = ({ farm }) => {
    const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);
    return (
        <div className={styles.description}>
            {transactionType} {transactionType === FarmTransactionType.Deposit ? "into" : "from"} the{" "}
            <a href={farm.source} className="span">
                {farm.url_name}
            </a>{" "}
            {transactionType === FarmTransactionType.Deposit ? "auto-compounding" : ""} liquidity pool.
            {currencySymbol === "ETH" ? ` "Max" excludes a little ETH for gas.` : ""}
        </div>
    );
};
