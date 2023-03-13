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
import { Skeleton } from "src/components/Skeleton/Skeleton";

interface IProps {}

export const TokenBalances: FC<IProps> = () => {
    const { lightMode } = useApp();
    const { tokens, lpTokens, isLoading } = useTokens();
    const { currentWallet } = useWallet();
    const navigate = useNavigate();
    const [selectedToken, setSelectedToken] = useState<Token>();

    return currentWallet ? (
        <div className={styles.container}>
            {!isLoading ? (
                tokens && lpTokens ? (
                    [
                        ...tokens.map((token) =>
                            Number(token.usdBalance) > 0.01 ? (
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
                                            {token.network ? (
                                                <span className={styles.networkName}>({token.network})</span>
                                            ) : null}
                                        </p>
                                        <p className={styles.balance}>
                                            {ethers.utils.commify(Number(token.balance).toString())}
                                        </p>
                                    </div>
                                    <p className={styles.usdBalance}>
                                        ${ethers.utils.commify(Number(token.usdBalance).toString())}
                                    </p>
                                </div>
                            ) : null
                        ),
                        ...lpTokens.map((token) =>
                            Number(token.usdBalance) > 0.01 ? (
                                <div
                                    key={token.address + token.network}
                                    className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}
                                    onClick={() =>
                                        token.name === "ETH" && token.network === "Mainnet"
                                            ? navigate("/exchange/?tab=bridge")
                                            : setSelectedToken(token)
                                    }
                                >
                                    <span>
                                        <img className={styles.tokenLogo} src={token.logo} alt="logo" />
                                        <img className={styles.tokenLogo2} src={token.logo2} alt="logo" />
                                    </span>
                                    <div>
                                        <p className={styles.name}>
                                            {token.name}
                                            {token.network ? (
                                                <span className={styles.networkName}>({token.network})</span>
                                            ) : null}
                                        </p>
                                        <p className={styles.balance}>
                                            {/* {token.balance && parseFloat(token.balance).toLocaleString()} */}
                                            {/* {token.balance && token.balance} */}
                                            {token.balance && parseFloat(token.balance) < 1
                                                ? token.balance
                                                : ethers.utils.commify(parseFloat(token.balance).toString())}
                                        </p>
                                    </div>
                                    <p className={styles.usdBalance}>
                                        ${ethers.utils.commify(parseFloat(token.usdBalance).toString())}
                                    </p>
                                </div>
                            ) : null
                        ),
                    ]
                ) : (
                    <EmptyComponent style={{ width: "100%", padding: "40px 24px" }}>
                        You wallet is empty.
                    </EmptyComponent>
                )
            ) : (
                <Skeleton w={"100%"} h={150} bg={lightMode ? "#ffffff" : undefined} bRadius={20} inverted={true} />
            )}
            {selectedToken ? <TransferToken token={selectedToken} setSelectedToken={setSelectedToken} /> : null}
        </div>
    ) : (
        <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
            Connect your wallet to view your balances
        </EmptyComponent>
    );
};
