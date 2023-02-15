import { useQuery } from "@tanstack/react-query";
import React from "react";
import useDeposit from "src/hooks/farms/useDeposit";
import useWithdraw from "src/hooks/farms/useWithdraw";
import useZapIn from "src/hooks/farms/useZapIn";
import useZapOut from "src/hooks/farms/useZapOut";
import useApp from "src/hooks/useApp";
import useEthPrice from "src/hooks/useEthPrice";
import useWallet from "src/hooks/useWallet";
import { Farm, FarmDetails } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { validateNumberDecimals } from "src/utils/common";
import styles from "./DetailInput.module.scss";
import farmFunctions from "src/api/pools";
import { FARM_DATA } from "src/config/constants/query";
import useConstants from "src/hooks/useConstants";

interface Props {
    farm: FarmDetails;
    shouldUseLp: boolean;
    type: FarmTransactionType;
}

const DetailInput: React.FC<Props> = ({ shouldUseLp, farm, type }) => {
    const { lightMode } = useApp();
    const { balance: ethUserBal, balanceBigNumber, provider, currentWallet } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { price: ethPrice } = useEthPrice();
    const [amount, setAmount] = React.useState(0.0);
    const [showInUsd, setShowInUsd] = React.useState(true);
    const { isLoading: isZapping, zapInAsync } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync } = useDeposit(farm);
    const { isLoading: isZappingOut, zapOutAsync } = useZapOut(farm);
    const { isLoading: isWithdrawing, withdrawAsync } = useWithdraw(farm);
    const [max, setMax] = React.useState(false);
    const { priceOfSingleToken } = farm;

    const { data: farmData, refetch } = useQuery(
        FARM_DATA(currentWallet, NETWORK_NAME, farm.id),
        () => farmFunctions[farm.id]?.getFarmData(provider, currentWallet, balanceBigNumber),
        {
            enabled: !!currentWallet && !!provider && !!farm,
        }
    );

    const maxBalance = React.useMemo(() => {
        if (type === FarmTransactionType.Deposit) {
            if (shouldUseLp) {
                return (
                    (showInUsd
                        ? Number(farmData?.Max_Token_Deposit_Balance_Dollar)
                        : Number(farmData?.Max_Token_Deposit_Balance)) || 0
                );
            } else {
                return (
                    (showInUsd
                        ? Number(farmData?.Max_Zap_Deposit_Balance_Dollar)
                        : Number(farmData?.Max_Zap_Deposit_Balance)) || 0
                );
            }
        } else {
            if (shouldUseLp) {
                return (
                    (showInUsd
                        ? Number(farmData?.Max_Token_Withdraw_Balance_Dollar)
                        : Number(farmData?.Max_Token_Withdraw_Balance)) || 0
                );
            } else {
                return (
                    (showInUsd
                        ? Number(farmData?.Max_Zap_Withdraw_Balance_Dollar)
                        : Number(farmData?.Max_Zap_Withdraw_Balance)) || 0
                );
            }
        }
    }, [shouldUseLp, showInUsd, type, farmData]);

    const getTokenAmount = () => {
        let amt = 0;
        if (farmData)
            if (shouldUseLp) {
                if (showInUsd) amt = amount / farmData.TOKEN_PRICE;
                else amt = amount;
            } else {
                if (type === FarmTransactionType.Deposit) {
                    if (showInUsd) amt = amount / farmData.ZAP_TOKEN_PRICE;
                    else amt = amount;
                } else {
                    if (showInUsd) amt = amount / farmData.TOKEN_PRICE;
                    else amt = (amount * farmData.ZAP_TOKEN_PRICE) / farmData.TOKEN_PRICE;
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
                setAmount((prev) => prev * priceOfSingleToken);
            }
        } else {
            if (!shouldUseLp) {
                setAmount((prev) => prev / ethPrice);
            } else {
                setAmount((prev) => prev / priceOfSingleToken);
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

    // Use to reload farm balances data on eth balance change
    React.useEffect(() => {
        refetch();
    }, [ethUserBal]);

    return (
        <div className={`${styles.container} ${lightMode && styles.container_light}`}>
            {/* Left */}
            <div>
                <div>Description</div>
                <br />
                <Description farm={farm} shouldUseLp={shouldUseLp} type={type} />
            </div>
            {/* Right */}
            <form
                className={`${styles.inputContainer} ${lightMode && styles.inputContainer_light}`}
                onSubmit={handleSubmit}
            >
                <div style={{ textAlign: "right" }}>
                    {shouldUseLp ? ` ${farm.name}` : " ETH"} Balance: &nbsp;
                    {showInUsd && "$ "}
                    {maxBalance.toFixed(6)}
                </div>
                <div></div>

                <div className={`${styles.inputWrapper} ${lightMode && styles.inputWrapper_light}`}>
                    <div style={{ display: "grid", gridTemplateColumns: "min-content 1fr" }}>
                        <span style={{ marginBottom: 2, opacity: showInUsd ? 1 : 0 }}>$</span>
                        <input
                            type="number"
                            placeholder="0.0"
                            required
                            value={amount.toString()}
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
                                className={`${styles.select} ${lightMode && styles.select_light}`}
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
