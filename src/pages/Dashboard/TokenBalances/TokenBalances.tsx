import { ethers } from "ethers";
import { FC } from "react";
import useApp from "src/hooks/useApp";
import { useTokens } from "src/hooks/useTokens";
import styles from "./TokenBalances.module.scss";

interface IProps {}

export const TokenBalances: FC<IProps> = (props) => {
    const { lightMode } = useApp();
    const { tokens } = useTokens();
    return (
        <div className={styles.container}>
            {tokens.map((token) =>
                Number(token.balance) > 0.01 ? (
                    <div className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}>
                        <img className={styles.tokenLogo} src={token.logo} alt="logo" />
                        <div className={styles.tokenDesription}>
                            <p className={styles.name}>{token.name}</p>
                            <p className={styles.balance}>{ethers.utils.commify(token.balance)}</p>
                        </div>
                        <p className={styles.usdBalance}>${ethers.utils.commify(token.usdBalance)}</p>
                    </div>
                ) : null
            )}
        </div>
    );
};
