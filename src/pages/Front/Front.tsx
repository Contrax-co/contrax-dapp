import React, { useState } from "react";
import styles from "./Front.module.scss";
import useApp from "src/hooks/useApp";
import useFront from "src/hooks/useFront";
import { ethers } from "ethers";
import { ReactComponent as AlpacaSvg } from "src/assets/images/alpaca.svg";
import { ReactComponent as BinanceSvg } from "src/assets/images/binance.svg";
import { ReactComponent as BitstampSvg } from "src/assets/images/bitstamp.svg";
import { ReactComponent as BittrexSvg } from "src/assets/images/bittrex.svg";
import { ReactComponent as CoinbaseSvg } from "src/assets/images/coinbase.svg";
import { ReactComponent as RobinhoodSvg } from "src/assets/images/robinhood.svg";
import Mfa from "./Mfa";

interface IProps {}

const Front: React.FC<IProps> = () => {
    const { lightMode } = useApp();
    const [mfa, setMfa] = useState("");
    const { handleCreateConnection, handleTransfer, holdings, loading, authData, mfaRequired } = useFront(mfa);

    return (
        <div className={styles.container}>
            <div className={styles.heading}>
                <h5>Access All you Wallets</h5>
                <p>Transfer your funds from any of your wallet of Defi Universe into Contrax</p>
            </div>
            <div className={styles.buttonWrapper}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logoCircle + " " + styles.onlyLargeScreen}>
                        <AlpacaSvg />
                    </div>
                    <div className={styles.logoCircle + " " + styles.onlyLargeScreen}>
                        <BitstampSvg color={lightMode ? "#003b2f" : "#00ff9c"} />
                    </div>
                    <div className={styles.logoCircle}>
                        <BinanceSvg />
                    </div>
                </div>
                <button
                    onClick={handleCreateConnection}
                    disabled={loading}
                    className={`custom-button ${lightMode && "custom-button-light"}`}
                >
                    {authData?.accessToken ? "Change Connection" : "Create Connection"}
                </button>
                <div className={styles.logoWrapper}>
                    <div className={styles.logoCircle}>
                        <CoinbaseSvg />
                    </div>
                    <div className={styles.logoCircle + " " + styles.onlyLargeScreen}>
                        <BittrexSvg />
                    </div>
                    <div className={styles.logoCircle + " " + styles.onlyLargeScreen}>
                        <RobinhoodSvg />
                    </div>
                </div>
            </div>

            {authData?.accessToken && (
                <div className={styles.tokenBalancesContainer}>
                    <h2 className={styles.balanceHeading}>{authData?.accessToken?.brokerName} Token Balances</h2>
                    <div className={styles.tokensWrapper}>
                        {holdings.map((token, i) => (
                            <div
                                key={i}
                                className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}
                                onClick={() => {
                                    handleTransfer(token.symbol);
                                }}
                            >
                                <img className={styles.tokenLogo} src={token.logo} alt="logo" />
                                <div>
                                    <p className={styles.name}>{token.symbol}</p>
                                    <p className={styles.balance}>
                                        {ethers.utils.commify(Number(token.balance).toString())}
                                    </p>
                                </div>
                                {/* <p className={styles.usdBalance}>
                                    {Number(token.usdAmount)
                                        .toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 3,
                                        })
                                        .slice(0, -1)}
                                </p> */}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {mfaRequired && <Mfa setMfa={setMfa} loading={loading} handleTransfer={handleTransfer} />}
        </div>
    );
};

export default Front;
