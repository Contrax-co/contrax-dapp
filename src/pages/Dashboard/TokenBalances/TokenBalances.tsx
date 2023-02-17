import { ethers } from "ethers";
import { FC, useState } from "react";
import useApp from "src/hooks/useApp";
import { useTokens } from "src/hooks/useTokens";
import styles from "./TokenBalances.module.scss";
import useWallet from "src/hooks/useWallet";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { TransferToken } from "src/components/modals/TransferToken/TransferToken";
import { Token } from "src/types";
import { useNavigate } from "react-router-dom";

interface IProps {}

export const TokenBalances: FC<IProps> = (props) => {
    const { lightMode } = useApp();
    const { tokens, refetchBalances } = useTokens();
    const { signer } = useWallet();
    const navigate = useNavigate();
    const [selectedToken, setSelectedToken] = useState<Token>();

    return signer ? (
        <div className={styles.container}>
            {tokens.map((token) =>
                Number(token.balance) > 0 ? (
                    <div
                        key={token.address + token.network}
                        className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}
                        onClick={() =>
                            token.name === "ETH" && token.network === "Mainnet"
                                ? navigate("/exchange/?tab=bridge")
                                : setSelectedToken(token)
                        }
                    >
                        <img className={styles.tokenLogo} src={token.logo} alt="logo" />
                        <div>
                            <p className={styles.name}>
                                {token.name}
                                {token.network ? <span className={styles.networkName}>({token.network})</span> : null}
                            </p>
                            <p className={styles.balance}>{ethers.utils.commify(Number(token.balance).toString())}</p>
                        </div>
                        <p className={styles.usdBalance}>
                            ${ethers.utils.commify(Number(token.usdBalance).toString())}
                        </p>
                    </div>
                ) : null
            )}
            {selectedToken ? (
                <TransferToken
                    token={selectedToken}
                    setSelectedToken={setSelectedToken}
                    refetchBalances={refetchBalances}
                />
            ) : null}
        </div>
    ) : (
        <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
            Connect your wallet to view your balances
        </EmptyComponent>
    );
};
