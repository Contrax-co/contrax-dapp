import { ethers } from "ethers";
import { FC } from "react";
import { useTokens } from "src/hooks/useTokens";
import styles from "./TokenBalances.module.scss";

interface IProps {}

export const TokenBalances: FC<IProps> = (props) => {
    const { tokens } = useTokens();
    return (
        <div className={styles.container}>
            {tokens.map((token) =>
                Number(token.balance) > 0.01 ? (
                    <div className={styles.tokenCard}>
                        <img className={styles.tokenLogo} src={token.logo} alt="logo" />
                        <div className={styles.tokenDesription}>
                            <p>TOKEN BALANCE</p>
                            <p>
                                <span className={styles.balance}>{ethers.utils.commify(token.balance)}</span>
                                <span className={styles.unit}>{token.name}</span>
                            </p>
                        </div>
                    </div>
                ) : null
            )}
        </div>
    );
};
