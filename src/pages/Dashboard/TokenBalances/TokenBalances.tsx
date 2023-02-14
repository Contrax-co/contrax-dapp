import { ethers } from "ethers";
import { FC } from "react";
import useApp from "src/hooks/useApp";
import { useTokens } from "src/hooks/useTokens";
import styles from "./TokenBalances.module.scss";
import ethLogo from "src/assets/images/ethereum-icon.png";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useWallet from "src/hooks/useWallet";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { floorToFixed } from "src/utils/common";

interface IProps {}

export const TokenBalances: FC<IProps> = (props) => {
    const { lightMode } = useApp();
    const { tokens } = useTokens();
    const ethAddress = "0x0000000000000000000000000000000000000000";
    const { balance, signer } = useWallet();
    const { prices } = usePriceOfTokens([ethAddress]);
    return signer ? (
        <div className={styles.container}>
            <div className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}>
                <img className={styles.tokenLogo} src={ethLogo} alt="logo" />
                <div className={styles.tokenDesription}>
                    <p className={styles.name}>ETH</p>
                    <p className={styles.balance}>
                        {ethers.utils.commify(
                            balance < 0.01 ? balance.toPrecision(2).slice(0, -1) : floorToFixed(balance, 2).toString()
                        )}
                    </p>
                </div>
                <p className={styles.usdBalance}>
                    $
                    {ethers.utils.commify(
                        balance * prices[ethAddress] < 0.01
                            ? (balance * prices[ethAddress]).toPrecision(2).slice(0, -1)
                            : floorToFixed(balance * prices[ethAddress], 2).toString()
                    )}
                </p>
            </div>
            {tokens.map((token) =>
                Number(token.balance) > 0.01 ? (
                    <div key={token.address} className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}>
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
    ) : (
        <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
            Connect your wallet to view your balances
        </EmptyComponent>
    );
};
