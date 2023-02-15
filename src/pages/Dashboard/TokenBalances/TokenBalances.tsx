import { ethers } from "ethers";
import { FC, useState } from "react";
import useApp from "src/hooks/useApp";
import { useTokens } from "src/hooks/useTokens";
import styles from "./TokenBalances.module.scss";
import useWallet from "src/hooks/useWallet";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { TransferToken } from "src/components/modals/TransferToken/TransferToken";
import { Token } from "src/types";

interface IProps {}

export const TokenBalances: FC<IProps> = (props) => {
    const { lightMode } = useApp();
    const { tokens } = useTokens();
    const { signer } = useWallet();
    const [selectedToken, setSelectedToken] = useState<Token>();

    return signer ? (
        <div className={styles.container}>
            {tokens.map((token) =>
                Number(token.balance) > 0 ? (
                    <div
                        key={token.address}
                        className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}
                        onClick={() => setSelectedToken(token)}
                    >
                        <img className={styles.tokenLogo} src={token.logo} alt="logo" />
                        <div className={styles.tokenDesription}>
                            <p className={styles.name}>{token.name}</p>
                            <p className={styles.balance}>{ethers.utils.commify(token.balance)}</p>
                        </div>
                        <p className={styles.usdBalance}>${ethers.utils.commify(token.usdBalance)}</p>
                    </div>
                ) : null
            )}
            {selectedToken ? <TransferToken token={selectedToken} setSelectedToken={setSelectedToken} /> : null}
        </div>
    ) : (
        <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
            Connect your wallet to view your balances
        </EmptyComponent>
    );
};
