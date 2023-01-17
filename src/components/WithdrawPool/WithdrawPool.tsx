import { useState, useMemo } from "react";
import "./Withdraw.scss";
import Toggle from "src/components/CompoundItem/Toggle";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import { Farm } from "src/types";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useBalances from "src/hooks/useBalances";
import useZapOut from "src/hooks/farms/useZapOut";
import useWithdraw from "src/hooks/farms/useWithdraw";
import useEthPrice from "src/hooks/useEthPrice";

interface Props {
    farm: Farm;
}

enum WITHDRAW_TYPE {
    ETH = "ETH",
    LP = "LP",
}

const WithdrawPool: React.FC<Props> = ({ farm }) => {
    const { connectWallet, currentWallet } = useWallet();
    const { lightMode } = useApp();
    const [withdrawType, setWithdrawType] = useState<WITHDRAW_TYPE>(
        farm.token_type === "Token" ? WITHDRAW_TYPE.LP : WITHDRAW_TYPE.ETH
    );

    const [showInUsd, setShowInUsd] = useState(false);

    const [withdrawAmt, setWithdrawAmt] = useState(0.0);

    const { formattedBalances } = useBalances([{ address: farm.vault_addr, decimals: farm.decimals }]);
    const userVaultBal = useMemo(() => formattedBalances[farm.vault_addr], [formattedBalances, farm.vault_addr]);

    const { zapOutAsync, isLoading: isZappingOut } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync } = useWithdraw(farm);
    const { price: ethPrice } = useEthPrice();
    const {
        prices: { [farm.lp_address]: price },
    } = usePriceOfTokens([farm.lp_address]);

    const maxBalance = useMemo(() => {
        if (withdrawType === WITHDRAW_TYPE.LP) {
            return showInUsd ? userVaultBal * price : userVaultBal;
        } else {
            return showInUsd ? userVaultBal * price : (userVaultBal * price) / ethPrice;
        }
    }, [withdrawType, showInUsd, userVaultBal, price, ethPrice]);

    const handleWithdrawChange = (e: any) => {
        setWithdrawAmt(e.target.value);
    };

    const getLpAmount = () => {
        // LP amount to withdraw
        let amt = 0;
        if (showInUsd) {
            // WithdrawAmt is in USD
            amt = withdrawAmt / price;
        } else {
            // withdrawAmt is in ETH
            if (withdrawType === WITHDRAW_TYPE.ETH) amt = (withdrawAmt * ethPrice) / price;
            // withdrawAmt is in LP
            else amt = withdrawAmt;
        }
        return amt;
    };

    async function withdrawFunction() {
        await withdrawAsync({ withdrawAmount: getLpAmount() });
        setWithdrawAmt(0);
    }

    async function zapOutFunction() {
        await zapOutAsync({ withdrawAmt: getLpAmount() });
        setWithdrawAmt(0);
    }

    const setMax = () => {
        setWithdrawAmt(maxBalance);
    };

    const handleShowInUsdChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setShowInUsd(e.target.value === "true");
        if (e.target.value === "true") {
            if (withdrawType === WITHDRAW_TYPE.ETH) {
                setWithdrawAmt((prev) => prev * ethPrice);
            } else {
                setWithdrawAmt((prev) => prev * price);
            }
        } else {
            if (withdrawType === WITHDRAW_TYPE.ETH) {
                setWithdrawAmt((prev) => prev / ethPrice);
            } else {
                setWithdrawAmt((prev) => prev / price);
            }
        }
    };

    return (
        <div className="whole_tab">
            {farm.token_type === "LP Token" ? (
                <Toggle
                    active={withdrawType === WITHDRAW_TYPE.LP}
                    farm={farm}
                    onClick={() =>
                        setWithdrawType(withdrawType === WITHDRAW_TYPE.ETH ? WITHDRAW_TYPE.LP : WITHDRAW_TYPE.ETH)
                    }
                />
            ) : null}

            <div className="detail_container">
                <div className={`withdrawal_description ${lightMode && "withdrawal_description--light"}`}>
                    <p className={`withdrawal_title ${lightMode && "withdrawal_title--light"}`}>Description</p>

                    {withdrawType === WITHDRAW_TYPE.LP ? (
                        <p className="withdrawal_description2">
                            Withdraw into tokens for the {farm.platform} liquidity pool for{" "}
                            <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                                {farm.name}
                            </a>
                            . You can re-stake it when you wish, or swap it for ETH or other tokens, including LP
                            tokens, on our exchange page.
                            <br /> <br />
                            After withdrawing, remember to confirm the transaction in your wallet.{" "}
                        </p>
                    ) : (
                        <p className="withdrawal_description2">
                            Withdraw into ETH directly from {farm.platform} liquidity pool for{" "}
                            <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                                {farm.name}
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
                                <p>{withdrawType === WITHDRAW_TYPE.LP ? "LP Balance:" : "ETH Balance:"}</p>
                                <p>0</p>
                            </div>
                        ) : (
                            <div className={`lp_bal ${lightMode && "lp_bal--light"}`}>
                                <p>{withdrawType === WITHDRAW_TYPE.LP ? "LP Balance:" : "ETH Balance:"}</p>
                                <p>
                                    {showInUsd && "$ "}
                                    {maxBalance}
                                    {!showInUsd && ` ${withdrawType === WITHDRAW_TYPE.LP ? farm.name : "ETH"}`}
                                </p>
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
                                <select
                                    value={showInUsd.toString()}
                                    className="currency_select"
                                    onChange={handleShowInUsdChange}
                                >
                                    <option value={"false"} className="currency_select">
                                        {withdrawType === WITHDRAW_TYPE.LP ? farm.name : "ETH"}
                                    </option>
                                    <option value={"true"} className="currency_select">
                                        USD
                                    </option>
                                </select>

                                <p className={`withdraw_max ${lightMode && "withdraw_max--light"}`} onClick={setMax}>
                                    MAX
                                </p>
                            </div>

                            <div className={`withdraw_withdraw ${lightMode && "withdraw_withdraw--light"}`}>
                                {!withdrawAmt || withdrawAmt <= 0 ? (
                                    <div
                                        className={`withdraw_zap1_button_disable ${
                                            lightMode && "withdraw_zap1_button_disable--light"
                                        }`}
                                    >
                                        <p>Withdraw</p>
                                    </div>
                                ) : withdrawAmt > maxBalance ? (
                                    <div
                                        className={`withdraw_zap1_button_disable ${
                                            lightMode && "withdraw_zap1_button_disable--light"
                                        }`}
                                    >
                                        <p>Insufficient Balance</p>
                                    </div>
                                ) : (
                                    <button
                                        className={`deposit_zap_button ${lightMode && "deposit_zap_button--light"}`}
                                        onClick={withdrawType === WITHDRAW_TYPE.LP ? withdrawFunction : zapOutFunction}
                                        disabled={withdrawType === WITHDRAW_TYPE.LP ? isWithdrawing : isZappingOut}
                                    >
                                        <p>Withdraw</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {currentWallet ? null : (
                        <div className={`no_overlay ${!currentWallet && "overlay"}`} onClick={connectWallet}>
                            <p>Connect Wallet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithdrawPool;
