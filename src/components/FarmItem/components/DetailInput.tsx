import React from "react";
import useDeposit from "src/hooks/farms/useDeposit";
import useWithdraw from "src/hooks/farms/useWithdraw";
import useZapIn from "src/hooks/farms/useZapIn";
import useZapOut from "src/hooks/farms/useZapOut";
import useApp from "src/hooks/useApp";
import useBalances from "src/hooks/useBalances";
import useEthPrice from "src/hooks/useEthPrice";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useWallet from "src/hooks/useWallet";
import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { validateNumberDecimals } from "src/utils/common";
import styles from "./DetailInput.module.scss";

interface Props {
    farm: Farm;
    shouldUseLp: boolean;
    type: FarmTransactionType;
}

const DetailInput: React.FC<Props> = ({ shouldUseLp, farm, type }) => {
    const { lightMode } = useApp();
    const { balance: ethUserBal } = useWallet();
    const { price: ethPrice } = useEthPrice();
    const [amount, setAmount] = React.useState(0.0);
    const [showInUsd, setShowInUsd] = React.useState(true);
    const { isLoading: isZapping, zapInAsync } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync } = useDeposit(farm);
    const { isLoading: isZappingOut, zapOutAsync } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync } = useWithdraw(farm);
    const [max, setMax] = React.useState(false);

    const {
        prices: { [farm.lp_address]: tokenPrice },
    } = usePriceOfTokens([farm.lp_address]);

    const { formattedBalances, refetch } = useBalances([
        { address: farm.lp_address, decimals: farm.decimals },
        { address: farm.vault_addr, decimals: farm.decimals },
    ]);
    const userLpBal = React.useMemo(() => formattedBalances[farm.lp_address], [formattedBalances, farm.lp_address]);
    const userVaultBal = React.useMemo(() => formattedBalances[farm.vault_addr], [formattedBalances, farm.vault_addr]);

    const maxBalance = React.useMemo(() => {
        if (type === FarmTransactionType.Deposit) {
            if (shouldUseLp) {
                return showInUsd ? userLpBal * tokenPrice : userLpBal;
            } else {
                return showInUsd ? ethPrice * ethUserBal : ethUserBal;
            }
        } else {
            if (shouldUseLp) {
                return showInUsd ? userVaultBal * tokenPrice : userVaultBal;
            } else {
                return showInUsd ? userVaultBal * tokenPrice : (userVaultBal * tokenPrice) / ethPrice;
            }
        }
    }, [shouldUseLp, showInUsd, userVaultBal, tokenPrice, ethPrice, userLpBal, type, ethUserBal]);

    const getTokenAmount = () => {
        let amt = 0;

        if (shouldUseLp) {
            if (showInUsd) amt = amount / tokenPrice;
            else amt = amount;
        } else {
            if (type === FarmTransactionType.Deposit) {
                if (showInUsd) amt = amount / ethPrice;
                else amt = amount;
            } else {
                if (showInUsd) amt = amount / tokenPrice;
                else amt = (amount * ethPrice) / tokenPrice;
            }
        }
        return Number(validateNumberDecimals(amt, farm.decimals));
    };

    const handleShowInUsdChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setShowInUsd(e.target.value === "true");

        if (e.target.value === "true") {
            if (!shouldUseLp) {
                setAmount((prev) => prev * ethPrice);
            } else {
                setAmount((prev) => prev * tokenPrice);
            }
        } else {
            if (!shouldUseLp) {
                setAmount((prev) => prev / ethPrice);
            } else {
                setAmount((prev) => prev / tokenPrice);
            }
        }
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        if (type === FarmTransactionType.Deposit) {
            if (shouldUseLp) {
                await depositAsync({ depositAmount: getTokenAmount(), max });
            } else {
                await zapInAsync({ ethZapAmount: getTokenAmount(), max });
            }
        } else {
            if (shouldUseLp) {
                await withdrawAsync({ withdrawAmount: getTokenAmount(), max });
            } else {
                await zapOutAsync({ withdrawAmt: getTokenAmount(), max });
            }
        }
        setAmount(0);
        setMax(false);
        refetch();
    };

    const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setAmount(Number(e.target.value));
        setMax(false);
    };

    const dontShowUsdSelect = React.useMemo(() => {
        switch (farm.name) {
            case "Usdt":
                return true;
            case "Usdc":
                return true;
            default:
                return false;
        }
    }, [farm]);

    React.useEffect(() => {
        if (max) setAmount(maxBalance);
    }, [max, maxBalance]);

    return (
        <div className={styles.container}>
            {/* Left */}
            <div>
                <div>Description</div>
                <br />
                <Description farm={farm} shouldUseLp={shouldUseLp} type={type} />
            </div>
            {/* Right */}
            <form className={styles.inputContainer} onSubmit={handleSubmit}>
                <div style={{ textAlign: "right" }}>
                    {shouldUseLp ? ` ${farm.name}` : " ETH"} Balance: &nbsp;
                    {showInUsd && "$ "}
                    {maxBalance.toFixed(6)}
                </div>
                <div></div>

                <div className={styles.inputWrapper}>
                    <div style={{ display: "grid", gridTemplateColumns: "min-content 1fr" }}>
                        <span style={{ marginBottom: 2, opacity: showInUsd ? 1 : 0 }}>$</span>
                        <input
                            type="number"
                            placeholder="0.0"
                            required
                            value={amount}
                            max={maxBalance}
                            onChange={handleInput}
                        />
                    </div>
                    <div className={styles.maxContainer}>
                        <p className={styles.maxBtn} onClick={() => setMax(true)}>
                            MAX
                        </p>
                        {!dontShowUsdSelect && (
                            <select
                                value={showInUsd.toString()}
                                onChange={handleShowInUsdChange}
                                className={styles.select}
                            >
                                <option value={"false"} className="currency_select">
                                    {shouldUseLp ? farm.name : "ETH"}
                                </option>
                                <option value={"true"} className="currency_select">
                                    USD
                                </option>
                            </select>
                        )}
                    </div>
                </div>
                <button
                    className={`custom-button ${lightMode && "custom-button-light"}`}
                    type="submit"
                    disabled={
                        amount <= 0 ||
                        (type === FarmTransactionType.Deposit
                            ? isZapping || isDepositing
                            : isWithdrawing || isZappingOut)
                    }
                >
                    {amount > 0
                        ? amount > maxBalance
                            ? "Insufficent Balance"
                            : type === FarmTransactionType.Deposit
                            ? "Deposit"
                            : "Withdraw"
                        : "Enter Amount"}
                </button>
            </form>
        </div>
    );
};

export default DetailInput;

const Description: React.FC<{ type: FarmTransactionType; farm: Farm; shouldUseLp: boolean }> = ({
    type,
    farm,
    shouldUseLp,
}) => {
    if (type === FarmTransactionType.Deposit && shouldUseLp)
        return (
            <div>
                Deposit your tokens for {farm.platform}'s{" "}
                <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                    {farm.name}
                </a>{" "}
                pool. Your tokens wil be staked on {farm.platform} for fees and rewards. All rewards are sold to
                auto-compound your position. <br />
                <br />
                After depositing, remember to confirm the transaction in your wallet.{" "}
            </div>
        );
    else if (type === FarmTransactionType.Deposit && !shouldUseLp)
        return (
            <div>
                Deposit with ETH directly into the {farm.platform} liquidity pool for{" "}
                <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                    {farm.name}
                </a>
                . Your ETH will be swapped for LP tokens to earn fees and rewards, which are sold to auto-compound your
                LP position. Note that "Max" leaves a small amount of ETH for gas. You'll need it to exit the farm
                later.
                <br />
                <br />
                After depositing, remember to confirm the transaction in your wallet.
            </div>
        );
    else if (type === FarmTransactionType.Withdraw && shouldUseLp)
        return (
            <div>
                Withdraw into tokens for the {farm.platform} liquidity pool for{" "}
                <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                    {farm.name}
                </a>
                . You can re-stake it when you wish, or swap it for ETH or other tokens, including LP tokens, on our
                exchange page.
                <br /> <br />
                After withdrawing, remember to confirm the transaction in your wallet.{" "}
            </div>
        );
    else if (type === FarmTransactionType.Withdraw && !shouldUseLp)
        return (
            <div>
                Withdraw into ETH directly from {farm.platform} liquidity pool for{" "}
                <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                    {farm.name}
                </a>
                . Note that the balance is shown in terms of LP tokens, but once withdrawn, you will receive ETH in your
                wallet.
                <br /> <br />
                After withdrawing, remember to confirm the transaction(s) in your wallet.{" "}
            </div>
        );
    return null;
};

