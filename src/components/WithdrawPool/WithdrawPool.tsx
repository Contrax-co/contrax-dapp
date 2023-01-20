import { useState, useMemo } from "react";
import "./Withdraw.scss";
import Toggle from "src/components/FarmItem/Toggle";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import { Farm } from "src/types";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useBalances from "src/hooks/useBalances";
import useZapOut from "src/hooks/farms/useZapOut";
import useWithdraw from "src/hooks/farms/useWithdraw";
import useEthPrice from "src/hooks/useEthPrice";
import { validateNumberDecimals } from "src/utils/common";
import styles from "./Withdraw.module.scss";

interface Props {
    farm: Farm;
    shouldUseLp: boolean;
    setShouldUseLp: (shouldUseLp: boolean | ((prev: boolean) => boolean)) => void;
}

const WithdrawPool: React.FC<Props> = ({ farm, shouldUseLp, setShouldUseLp }) => {
    const { connectWallet, currentWallet } = useWallet();
    const { lightMode } = useApp();

    const [showInUsd, setShowInUsd] = useState(true);

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
        if (shouldUseLp) {
            return showInUsd ? userVaultBal * price : userVaultBal;
        } else {
            return showInUsd ? userVaultBal * price : (userVaultBal * price) / ethPrice;
        }
    }, [shouldUseLp, showInUsd, userVaultBal, price, ethPrice]);

    const handleWithdrawChange = (e: any) => {
        setWithdrawAmt(e.target.value);
    };

    const getLpAmount = () => {
        // LP amount to withdraw
        let amt = 0;
        if (showInUsd) {
            // WithdrawAmt in Lp input is in USD
            if (shouldUseLp) amt = withdrawAmt / price;
            // WithdrawAmt in Eth input is in USD
            else amt = withdrawAmt / price;
        } else {
            // WithdrawAmt in LP input is in LP
            if (shouldUseLp) amt = withdrawAmt;
            // WithdrawAmt in Eth input is in Eth
            else amt = (withdrawAmt * ethPrice) / price;
        }
        return Number(validateNumberDecimals(amt, farm.decimals));
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
            if (!shouldUseLp) {
                setWithdrawAmt((prev) => prev * ethPrice);
            } else {
                setWithdrawAmt((prev) => prev * price);
            }
        } else {
            if (!shouldUseLp) {
                setWithdrawAmt((prev) => prev / ethPrice);
            } else {
                setWithdrawAmt((prev) => prev / price);
            }
        }
    };

    return (
        <div className="whole_tab">
            <div className={styles.addliquidity_descriptiontab}>
                <div
                    className={`${styles.addliquidity_description} ${
                        lightMode && styles["addliquidity_description--light"]
                    }`}
                >
                    <p className={`withdrawal_title ${lightMode && "withdrawal_title--light"}`}>Description</p>

                    {shouldUseLp ? (
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

                <div className={`${styles.addliquidity_tab} ${lightMode && styles["addliquidity_tab--light"]}`}>
                    <div className={`inside_toggle ${!currentWallet && "inside_toggle-none"}`}>
                        {userVaultBal * price < 0.01 ? (
                            <div className={`lp_bal ${lightMode && "lp_bal--light"}`}>
                                <p>Balance</p>
                                <p>0</p>
                            </div>
                        ) : (
                            <div className={`lp_bal ${lightMode && "lp_bal--light"}`}>
                                {/* <p>{withdrawType === WITHDRAW_TYPE.LP ? "LP Balance:" : "ETH Balance:"}</p> */}
                                <p>Balance</p>
                                <p>
                                    {showInUsd && "$ "}
                                    {maxBalance}
                                    {!showInUsd && ` ${shouldUseLp ? farm.name : "ETH"}`}
                                </p>
                            </div>
                        )}

                        <div className={`withdraw_tab2 ${!currentWallet && "withdraw_tab2-disable"}`}>
                            <div className={`lp_withdraw_amount ${lightMode && "lp_withdraw_amount--light"}`}>
                                {showInUsd && <span style={{ marginBottom: 2 }}>$</span>}
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
                                        {shouldUseLp ? farm.name : "ETH"}
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
                                    <button
                                        className={`custom-button ${lightMode && "custom-button-light"}`}
                                        disabled={true}
                                    >
                                        Withdraw
                                    </button>
                                ) : withdrawAmt > maxBalance ? (
                                    <button
                                        className={`custom-button ${lightMode && "custom-button-light"}`}
                                        disabled={true}
                                    >
                                        Insufficient Balance
                                    </button>
                                ) : (
                                    <button
                                        className={`custom-button ${lightMode && "custom-button-light"}`}
                                        onClick={shouldUseLp ? withdrawFunction : zapOutFunction}
                                        disabled={shouldUseLp ? isWithdrawing : isZappingOut}
                                    >
                                        Withdraw
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
