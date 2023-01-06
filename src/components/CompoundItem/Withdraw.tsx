import { useState, useEffect } from "react";
import { getUserVaultBalance, withdraw, withdrawAll, zapOut } from "src/components/WithdrawPool/withdraw-function";
import { MoonLoader } from "react-spinners";
import "./Withdraw.css";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdOutlineErrorOutline } from "react-icons/md";
import { priceToken } from "src/components/CompoundItem/compound-functions";
import Toggle from "src/components/CompoundItem/Toggle";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import { BLOCK_EXPLORER_URL } from "src/config/constants";

function Withdraw({ pool }: any) {
    const { lightMode } = useApp();
    const { connectWallet, currentWallet } = useWallet();
    const [toggleType, setToggleType] = useState(() => {
        if (pool.token_type === "Token") {
            return true;
        } else {
            return false;
        }
    });
    const [loaderMessage, setLoaderMessage] = useState("");
    const [isLoading, setLoading] = useState(false);

    const [withdrawAmt, setWithdrawAmt] = useState(0.0);

    const [userVaultBal, setUserVaultBalance] = useState(0);
    const [success, setSuccess] = useState("loading");
    const [secondaryMessage, setSecondaryMessage] = useState("");

    const [price, setPrice] = useState(0);
    const [link, setLink] = useState(false);
    const [hash, setHash] = useState("");

    const refresh = () => window.location.reload();

    useEffect(() => {
        getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
        priceToken(pool.lp_address, setPrice);
    }, [pool, currentWallet]);

    const handleWithdrawChange = (e: any) => {
        setWithdrawAmt(e.target.value);
    };

    function withdrawFunction() {
        if (withdrawAmt === userVaultBal) {
            withdrawAll(
                setUserVaultBalance,
                currentWallet,
                setSuccess,
                setSecondaryMessage,
                pool,
                setWithdrawAmt,
                setLoading,
                setLoaderMessage,
                setLink,
                setHash
            );
        } else {
            withdraw(
                setUserVaultBalance,
                currentWallet,
                setSuccess,
                setSecondaryMessage,
                pool,
                withdrawAmt,
                setWithdrawAmt,
                setLoading,
                setLoaderMessage,
                setLink,
                setHash
            );
        }
    }

    function zapOutFunction() {
        zapOut(
            currentWallet,
            setUserVaultBalance,
            setSuccess,
            setLoading,
            setLoaderMessage,
            pool,
            withdrawAmt,
            setWithdrawAmt,
            setLink,
            setHash,
            setSecondaryMessage
        );
    }

    function withdrawMax() {
        setWithdrawAmt(userVaultBal);
    }

    function withdrawEthMax() {
        setWithdrawAmt((userVaultBal * 999) / 1000);
    }

    return (
        <div className="whole_tab">
            {pool.token_type === "LP Token" ? (
                <Toggle
                    lightMode={lightMode}
                    active={toggleType}
                    pool={pool}
                    onClick={() => setToggleType(!toggleType)}
                />
            ) : null}

            <div className="detail_container">
                <div className={`withdrawal_description ${lightMode && "withdrawal_description--light"}`}>
                    <p className={`withdrawal_title ${lightMode && "withdrawal_title--light"}`}>Description</p>

                    {toggleType ? (
                        <p className="withdrawal_description2">
                            Withdraw into tokens for the {pool.platform} liquidity pool for{" "}
                            <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                                {pool.name}
                            </a>
                            . You can re-stake it when you wish, or swap it for ETH or other tokens, including LP
                            tokens, on our exchange page.
                            <br /> <br />
                            After withdrawing, remember to confirm the transaction in your wallet.{" "}
                        </p>
                    ) : (
                        <p className="withdrawal_description2">
                            Withdraw into ETH directly from {pool.platform} liquidity pool for{" "}
                            <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                                {pool.name}
                            </a>
                            . Note that the balance is shown in terms of LP tokens, but once withdrawn, you will receive
                            ETH in your wallet.
                            <br /> <br />
                            After withdrawing, remember to confirm the transaction(s) in your wallet.{" "}
                        </p>
                    )}
                </div>

                <div className={`withdraw_tab ${lightMode && "withdraw_tab--light"}`}>
                    <div className={`inside_toggle ${!currentWallet && "inside_toggle-none"}`}>
                        {userVaultBal * price < 0.01 ? (
                            <div className={`lp_bal ${lightMode && "lp_bal--light"}`}>
                                <p>LP Balance:</p>
                                <p>0</p>
                            </div>
                        ) : (
                            <div className={`lp_bal ${lightMode && "lp_bal--light"}`}>
                                <p>LP Balance:</p>
                                <p>{userVaultBal.toFixed(10)}</p>
                            </div>
                        )}

                        <div className={`withdraw_tab2 ${!currentWallet && "withdraw_tab2-disable"}`}>
                            <div className={`lp_withdraw_amount ${lightMode && "lp_withdraw_amount--light"}`}>
                                <input
                                    type="number"
                                    className={`lp_bal_input ${lightMode && "lp_bal_input--light"}`}
                                    placeholder="0.0"
                                    value={withdrawAmt}
                                    onChange={handleWithdrawChange}
                                />

                                {toggleType ? (
                                    <p
                                        className={`withdraw_max ${lightMode && "withdraw_max--light"}`}
                                        onClick={withdrawMax}
                                    >
                                        max
                                    </p>
                                ) : (
                                    <p
                                        className={`withdraw_max ${lightMode && "withdraw_max--light"}`}
                                        onClick={withdrawEthMax}
                                    >
                                        max
                                    </p>
                                )}
                            </div>

                            {toggleType ? (
                                <div className={`withdraw_withdraw ${lightMode && "withdraw_withdraw--light"}`}>
                                    {!withdrawAmt || withdrawAmt <= 0 ? (
                                        <div
                                            className={`withdraw_zap1_button_disable ${
                                                lightMode && "withdraw_zap1_button_disable--light"
                                            }`}
                                        >
                                            <p>Withdraw</p>
                                        </div>
                                    ) : withdrawAmt > userVaultBal ? (
                                        <div
                                            className={`withdraw_zap1_button_disable ${
                                                lightMode && "withdraw_zap1_button_disable--light"
                                            }`}
                                        >
                                            <p>Insufficient Balance</p>
                                        </div>
                                    ) : (
                                        <div
                                            className={`deposit_zap_button ${lightMode && "deposit_zap_button--light"}`}
                                            onClick={withdrawFunction}
                                        >
                                            <p>Withdraw</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={`withdraw_withdraw ${lightMode && "withdraw_withdraw--light"}`}>
                                    {!withdrawAmt || withdrawAmt <= 0 ? (
                                        <div
                                            className={`withdraw_zap1_button_disable ${
                                                lightMode && "withdraw_zap1_button_disable--light"
                                            }`}
                                        >
                                            <p>Withdraw</p>
                                        </div>
                                    ) : withdrawAmt > userVaultBal ? (
                                        <div
                                            className={`withdraw_zap1_button_disable ${
                                                lightMode && "withdraw_zap1_button_disable--light"
                                            }`}
                                        >
                                            <p>Insufficient Balance</p>
                                        </div>
                                    ) : (
                                        <div
                                            className={`deposit_zap_button ${lightMode && "deposit_zap_button--light"}`}
                                            onClick={zapOutFunction}
                                        >
                                            <p>Withdraw</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {currentWallet ? null : (
                        <div className={`no_overlay ${!currentWallet && "overlay"}`} onClick={connectWallet}>
                            <p>Connect Wallet</p>
                        </div>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className={`withdraw_spinner ${lightMode && "withdraw_spinner--light"}`}>
                    <div className={`withdraw_spinner_top`}>
                        <div className={`withdraw_spinner-left`}>
                            {success === "success" ? (
                                <AiOutlineCheckCircle style={{ color: "#00E600", fontSize: "20px" }} />
                            ) : success === "loading" ? (
                                <MoonLoader size={20} loading={isLoading} color={"rgb(89, 179, 247)"} />
                            ) : success === "fail" ? (
                                <MdOutlineErrorOutline style={{ color: "#e60000" }} />
                            ) : null}
                        </div>

                        <div className={`withdraw_spinner_right`}>
                            <p style={{ fontWeight: "700" }}>{loaderMessage}</p>
                            <p className={`withdraw_second`}>{secondaryMessage}</p>
                        </div>
                    </div>

                    <div className={`withdraw_spinner_bottom`}>
                        {link ? (
                            <div
                                className={`withdraw_spinner_bottom_left`}
                                onClick={() => window.open(`${BLOCK_EXPLORER_URL}/tx/${hash}`, "_blank")}
                            >
                                <p>Details</p>
                            </div>
                        ) : null}

                        <div
                            className={`withdraw_spinner_bottom_right`}
                            onClick={() => {
                                setLoading(false);
                                setLink(false);
                                setHash("");
                                refresh();
                            }}
                        >
                            <p>Dismiss</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Withdraw;
