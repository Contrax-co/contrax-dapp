import { ethers } from "ethers";
import { FC, useCallback, useState } from "react";
import useApp from "src/hooks/useApp";
import { UIStateEnum, useTokens } from "src/hooks/useTokens";
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
    const { tokens, lpTokens, isLoading, UIState } = useTokens();
    const navigate = useNavigate();
    const [selectedToken, setSelectedToken] = useState<Token>();

    const handleCloseModal = useCallback(() => setSelectedToken(undefined), [setSelectedToken]);

    return (
        <>
            <p className={`dashboard_wallet_title ${lightMode && "dashboard_wallet_title--light"}`}>Token Balances</p>
            {UIState === UIStateEnum.CONNECT_WALLET && (
                <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
                    Connect your wallet to view your balances
                </EmptyComponent>
            )}
            {UIState === UIStateEnum.LOADING && (
                <Skeleton w={"100%"} h={150} bg={lightMode ? "#ffffff" : undefined} bRadius={20} inverted={true} />
            )}
            {UIState === UIStateEnum.NO_TOKENS && (
                <EmptyComponent
                    link="/buy?tab=Wert"
                    linkText="Click Here to get USDC to stake" 
                    style={{ width: "100%", padding: "40px 24px" }}
                >
                    {"You need USDC or ETH to enter the farms."}
                </EmptyComponent>
            )}

            {(UIState === UIStateEnum.SHOW_TOKENS_TOKENS || UIState === UIStateEnum.SHOW_TOKENS) && (
                <div className={styles.container}>
                    {tokens
                        .filter((token) => Number(token.usdBalance) > 0.01)
                        .map((token, i) => (
                            <div
                                key={i}
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
                                    {Number(token.usdBalance)
                                        .toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 3,
                                        })
                                        .slice(0, -1)}
                                </p>
                            </div>
                        ))}
                    {selectedToken ? <TransferToken token={selectedToken} handleClose={handleCloseModal} /> : null}
                </div>
            )}
            {(UIState === UIStateEnum.SHOW_TOKENS_LP || UIState === UIStateEnum.SHOW_TOKENS) && (
                <>
                    <p
                        className={`dashboard_wallet_title ${lightMode && "dashboard_wallet_title--light"}`}
                        style={{ marginTop: 20 }}
                    >
                        Dual Token Balances
                    </p>
                    <div className={styles.container}>
                        {lpTokens
                            .filter((t) => Number(t.usdBalance) > 0.01)
                            .map((token, i) => (
                                <div
                                    key={i}
                                    className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}
                                    onClick={() =>
                                        token.name === "ETH" && token.network === "Mainnet"
                                            ? navigate("/exchange/?tab=bridge")
                                            : setSelectedToken(token)
                                    }
                                >
                                    <span style={{ display: "flex" }}>
                                        <img
                                            className={styles.tokenLogo}
                                            src={token.logo}
                                            alt="logo"
                                            style={{ clipPath: "circle(50%)" }}
                                        />
                                        <img
                                            className={styles.tokenLogo2}
                                            src={token.logo2}
                                            alt="logo"
                                            style={{ clipPath: "circle(50%)" }}
                                        />
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
                            ))}
                    </div>
                </>
            )}
        </>
    );
};
