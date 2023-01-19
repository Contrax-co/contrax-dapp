import { useState, useEffect, useMemo } from "react";
import "./Deposit.css";
import { MoonLoader } from "react-spinners";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdOutlineErrorOutline } from "react-icons/md";
import Toggle from "src/components/FarmItem/Toggle";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import useConstants from "src/hooks/useConstants";
import { Farm } from "src/types";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useBalances from "src/hooks/useBalances";
import useZapIn from "src/hooks/farms/useZapIn";
import useDeposit from "src/hooks/farms/useDeposit";
import useEthPrice from "src/hooks/useEthPrice";
import { validateNumberDecimals } from "src/utils/common";

interface Props {
    farm: Farm;
    shouldUseLp: boolean;
    setShouldUseLp: (shouldUseLp: boolean | ((prev: boolean) => boolean)) => void;
}

const Deposit: React.FC<Props> = ({ farm, shouldUseLp }) => {
    const { lightMode } = useApp();
    const { connectWallet, currentWallet, balance: ethUserBal } = useWallet();
    const { price: ethPrice } = useEthPrice();
    const [depositAmount, setDepositAmount] = useState(0.0);
    const { isLoading: isZapping, zapInAsync } = useZapIn(farm);
    const { isLoading: isDepositing, depositAsync } = useDeposit(farm);
    const [showInUsd, setShowInUsd] = useState(true);
    const { formattedBalances } = useBalances([{ address: farm.lp_address, decimals: farm.decimals }]);
    const lpUserBal = useMemo(() => formattedBalances[farm.lp_address], [formattedBalances, farm.lp_address]);
    const {
        prices: { [farm.lp_address]: lpPrice },
    } = usePriceOfTokens([farm.lp_address]);

    const maxZapBalance = useMemo(
        () => (showInUsd ? ethPrice * ethUserBal : ethUserBal),
        [ethPrice, ethUserBal, showInUsd]
    );

    const maxLpBalance = useMemo(() => (showInUsd ? lpUserBal * lpPrice : lpUserBal), [showInUsd, lpUserBal, lpPrice]);

    const maxBalance = useMemo(
        () => (shouldUseLp ? maxLpBalance : maxZapBalance),
        [maxZapBalance, maxLpBalance, shouldUseLp]
    );

    const handleDepositAmountChange = (e: any) => {
        setDepositAmount(e.target.value);
    };

    function setMax() {
        setDepositAmount(maxBalance);
    }

    const getLpAmount = () => {
        // Amount to withdraw
        let amt = 0;
        if (showInUsd) {
            // Deposit is in USD => convert to LP
            if (shouldUseLp) amt = depositAmount / lpPrice;
            // Deposit is in USD => convert to Eth
            else amt = depositAmount / ethPrice;
        } else {
            // Deposit is in LP
            if (shouldUseLp) amt = depositAmount;
            // Deposit is in ETH
            else amt = depositAmount;
        }
        return Number(validateNumberDecimals(amt));
    };

    const handleDeposit = async () => {
        if (shouldUseLp) {
            await depositAsync({
                depositAmount: getLpAmount(),
            });
        } else {
            await zapInAsync({ ethZapAmount: getLpAmount() });
        }
        setDepositAmount(0);
    };

    const handleShowInUsdChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setShowInUsd(e.target.value === "true");

        if (e.target.value === "true") {
            if (!shouldUseLp) {
                setDepositAmount((prev) => prev * ethPrice);
            } else {
                setDepositAmount((prev) => prev * lpPrice);
            }
        } else {
            if (!shouldUseLp) {
                setDepositAmount((prev) => prev / ethPrice);
            } else {
                setDepositAmount((prev) => prev / lpPrice);
            }
        }
    };

    return (
        <div className="addliquidity_outsidetab">
            <div>
                <div className="addliquidity_descriptiontab">
                    <div className={`addliquidity_description ${lightMode && "addliquidity_description--light"}`}>
                        <p
                            className={`addliquidity_description_title ${
                                lightMode && "addliquidity_description_title--light"
                            }`}
                        >
                            Description
                        </p>
                        {shouldUseLp ? (
                            <p className="description_description">
                                Deposit your tokens for {farm.platform}'s{" "}
                                <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                                    {farm.name}
                                </a>{" "}
                                pool. Your tokens wil be staked on {farm.platform} for fees and rewards. All rewards are
                                sold to auto-compound your position. <br />
                                <br />
                                After depositing, remember to confirm the transaction in your wallet.{" "}
                            </p>
                        ) : (
                            <p className="description_description">
                                Deposit with ETH directly into the {farm.platform} liquidity pool for{" "}
                                <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                                    {farm.name}
                                </a>
                                . Your ETH will be swapped for LP tokens to earn fees and rewards, which are sold to
                                auto-compound your LP position. Note that "Max" leaves a small amount of ETH for gas.
                                You'll need it to exit the farm later.
                                <br />
                                <br />
                                After depositing, remember to confirm the transaction in your wallet.
                            </p>
                        )}
                    </div>

                    <div className={`addliquidity_tab ${lightMode && "addliquidity_tab--light"}`}>
                        <div className={`inside_toggle ${!currentWallet && "inside_toggle-none"}`}>
                            <div className={`addliquidity_weth_bal ${lightMode && "addliquidity_weth_bal--light"}`}>
                                <p>Balance:</p>
                                <p>
                                    {showInUsd && "$ "}
                                    {maxBalance.toFixed(4)}
                                    {!showInUsd && (shouldUseLp ? ` ${farm.name}` : " ETH")}
                                </p>
                            </div>
                            <div className={`deposit_tab ${!currentWallet && "deposit_tab-disable"}`}>
                                <div className={`weth_deposit_amount ${lightMode && "weth_deposit_amount--light"}`}>
                                    {showInUsd && <span style={{ marginBottom: 2 }}>$</span>}
                                    <input
                                        type="number"
                                        className={`weth_bal_input ${lightMode && "weth_bal_input--light"}`}
                                        placeholder="0.0"
                                        value={depositAmount}
                                        onChange={handleDepositAmountChange}
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
                                    <p className={`deposit_max ${lightMode && "deposit_max--light"}`} onClick={setMax}>
                                        MAX
                                    </p>
                                </div>

                                <div className={`deposit_deposits ${lightMode && "deposit_deposits--light"}`}>
                                    {!depositAmount || depositAmount <= 0 ? (
                                        <button
                                            className={`deposit_zap1_button_disable ${
                                                lightMode && "deposit_zap1_button_disable--light"
                                            }`}
                                        >
                                            <p>Deposit</p>
                                        </button>
                                    ) : depositAmount > maxBalance ? (
                                        <button
                                            className={`deposit_zap1_button_disable ${
                                                lightMode && "deposit_zap1_button_disable--light"
                                            }`}
                                        >
                                            <p>Insufficient Balance</p>
                                        </button>
                                    ) : (
                                        <button
                                            className={`deposit_zap_button ${
                                                lightMode && "deposit_zap_button--light"
                                            } ${isZapping || (isDepositing && "deposit_zap1_button_disable")}`}
                                            onClick={handleDeposit}
                                            disabled={isZapping || isDepositing}
                                        >
                                            <p>Deposit</p>
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
        </div>
    );
};

export default Deposit;
