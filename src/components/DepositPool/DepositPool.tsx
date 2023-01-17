import { useState, useEffect, useMemo } from "react";
import "./Deposit.css";
import { MoonLoader } from "react-spinners";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdOutlineErrorOutline } from "react-icons/md";
import Toggle from "src/components/CompoundItem/Toggle";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import useConstants from "src/hooks/useConstants";
import { Farm } from "src/types";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useBalances from "src/hooks/useBalances";
import useZapIn from "src/hooks/farms/useZapIn";
import useDeposit from "src/hooks/farms/useDeposit";
import useEthPrice from "src/hooks/useEthPrice";

interface Props {
    farm: Farm;
}

const Deposit: React.FC<Props> = ({ farm }) => {
    const [toggleType, setToggleType] = useState(() => {
        if (farm.token_type === "Token") {
            return true;
        } else {
            return false;
        }
    });

    return (
        <div className="addliquidity_outsidetab">
            {farm.token_type === "LP Token" ? (
                <Toggle active={toggleType} farm={farm} onClick={() => setToggleType(!toggleType)} />
            ) : null}

            {toggleType ? <FarmDeposit farm={farm} /> : <ZapDeposit farm={farm} />}
        </div>
    );
};

export default Deposit;

const ZapDeposit: React.FC<Props> = ({ farm }) => {
    const { lightMode } = useApp();
    const { connectWallet, currentWallet, balance: ethUserBal } = useWallet();
    const { price: ethPrice } = useEthPrice();
    const [ethDepositAmount, setEthDepositAmount] = useState(0.0);
    const { isLoading, zapInAsync } = useZapIn(farm);
    const [showInUsd, setShowInUsd] = useState(false);
    const maxBalance = useMemo(
        () => (showInUsd ? ethPrice * ethUserBal : ethUserBal),
        [ethPrice, ethUserBal, showInUsd]
    );

    const handleEthDepositChange = (e: any) => {
        setEthDepositAmount(e.target.value);
    };

    function maxEthDeposit() {
        setEthDepositAmount(maxBalance);
    }

    async function zapDeposit() {
        const amt = showInUsd ? ethDepositAmount / ethPrice : ethDepositAmount;
        await zapInAsync({ ethZapAmount: amt });
        setEthDepositAmount(0);
    }

    const handleShowInUsdChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setShowInUsd(e.target.value === "true");
        if (e.target.value === "true") {
            setEthDepositAmount(ethDepositAmount * ethPrice);
        } else setEthDepositAmount(ethDepositAmount / ethPrice);
    };

    return (
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
                    <p className="description_description">
                        Deposit with ETH directly into the {farm.platform} liquidity pool for{" "}
                        <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                            {farm.name}
                        </a>
                        . Your ETH will be swapped for LP tokens to earn fees and rewards, which are sold to
                        auto-compound your LP position. Note that "Max" leaves a small amount of ETH for gas. You'll
                        need it to exit the farm later.
                        <br />
                        <br />
                        After depositing, remember to confirm the transaction in your wallet.
                    </p>
                </div>

                <div className={`addliquidity_tab ${lightMode && "addliquidity_tab--light"}`}>
                    <div className={`inside_toggle ${!currentWallet && "inside_toggle-none"}`}>
                        <div className={`addliquidity_weth_bal ${lightMode && "addliquidity_weth_bal--light"}`}>
                            <p>ETH balance:</p>
                            <p>
                                {showInUsd && "$ "}
                                {maxBalance.toFixed(2)}
                                {!showInUsd && " ETH"}
                            </p>
                        </div>
                        <div className={`deposit_tab ${!currentWallet && "deposit_tab-disable"}`}>
                            <div className={`weth_deposit_amount ${lightMode && "weth_deposit_amount--light"}`}>
                                <input
                                    type="number"
                                    className={`weth_bal_input ${lightMode && "weth_bal_input--light"}`}
                                    placeholder="0.0"
                                    value={ethDepositAmount}
                                    onChange={handleEthDepositChange}
                                />
                                <select
                                    value={showInUsd.toString()}
                                    className="currency_select"
                                    onChange={handleShowInUsdChange}
                                >
                                    <option value={"false"} className="currency_select">
                                        ETH
                                    </option>
                                    <option value={"true"} className="currency_select">
                                        USD
                                    </option>
                                </select>
                                <p
                                    className={`deposit_max ${lightMode && "deposit_max--light"}`}
                                    onClick={maxEthDeposit}
                                >
                                    MAX
                                </p>
                            </div>

                            <div className={`deposit_deposits ${lightMode && "deposit_deposits--light"}`}>
                                {!ethDepositAmount || ethDepositAmount <= 0 ? (
                                    <button
                                        className={`deposit_zap1_button_disable ${
                                            lightMode && "deposit_zap1_button_disable--light"
                                        }`}
                                    >
                                        <p>Deposit</p>
                                    </button>
                                ) : ethDepositAmount > maxBalance ? (
                                    <button
                                        className={`deposit_zap1_button_disable ${
                                            lightMode && "deposit_zap1_button_disable--light"
                                        }`}
                                    >
                                        <p>Insufficient Balance</p>
                                    </button>
                                ) : (
                                    <button
                                        className={`deposit_zap_button ${lightMode && "deposit_zap_button--light"}`}
                                        onClick={zapDeposit}
                                        disabled={isLoading}
                                    >
                                        <p>Deposit</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {currentWallet ? null : (
                        <div className={`no_overlay ${!currentWallet && "overlay"}`} onClick={connectWallet}>
                            <p>connect wallet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FarmDeposit: React.FC<Props> = ({ farm }) => {
    const { lightMode } = useApp();
    const { connectWallet, currentWallet, balance: ethUserBal } = useWallet();
    const { formattedBalances } = useBalances([{ address: farm.lp_address, decimals: farm.decimals }]);
    const { isLoading, deposit } = useDeposit(farm);
    const [showInUsd, setShowInUsd] = useState(false);

    const lpUserBal = useMemo(() => formattedBalances[farm.lp_address], [formattedBalances, farm.lp_address]);

    const [lpDepositAmount, setLPDepositAmount] = useState(0.0);

    const {
        prices: { [farm.lp_address]: price },
    } = usePriceOfTokens([farm.lp_address]);
    const maxBalance = useMemo(() => (showInUsd ? lpUserBal * price : lpUserBal), [price, showInUsd, lpUserBal]);

    const handleDepositChange = (e: any) => {
        setLPDepositAmount(e.target.value);
    };

    function maxDeposit() {
        setLPDepositAmount(maxBalance);
    }

    async function depositAmount() {
        deposit({
            depositAmount: lpDepositAmount / price,
        });
    }

    const handleShowInUsdChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setShowInUsd(e.target.value === "true");
        if (e.target.value === "true") {
            setLPDepositAmount(lpDepositAmount * price);
        } else setLPDepositAmount(lpDepositAmount / price);
    };

    return (
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
                    <p className="description_description">
                        Deposit your tokens for {farm.platform}'s{" "}
                        <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">
                            {farm.name}
                        </a>{" "}
                        pool. Your tokens wil be staked on {farm.platform} for fees and rewards. All rewards are sold to
                        auto-compound your position. <br />
                        <br />
                        After depositing, remember to confirm the transaction in your wallet.{" "}
                    </p>
                </div>

                <div className={`addliquidity_tab ${lightMode && "addliquidity_tab--light"}`}>
                    <div className={`inside_toggle ${!currentWallet && "inside_toggle-none"}`}>
                        <div className={`addliquidity_weth_bal ${lightMode && "addliquidity_weth_bal--light"}`}>
                            <p>{farm.name} balance:</p>
                            {
                                <p>
                                    {showInUsd && "$ "}
                                    {maxBalance}
                                    {!showInUsd && ` ${farm.name}`}
                                </p>
                            }
                        </div>

                        <div className={`deposit_tab ${!currentWallet && "deposit_tab-disable"}`}>
                            <div className={`weth_deposit_amount ${lightMode && "weth_deposit_amount--light"}`}>
                                <input
                                    type="number"
                                    className={`weth_bal_input ${lightMode && "weth_bal_input--light"}`}
                                    placeholder="0.0"
                                    value={lpDepositAmount}
                                    onChange={handleDepositChange}
                                />
                                <select
                                    value={showInUsd.toString()}
                                    className="currency_select"
                                    onChange={handleShowInUsdChange}
                                >
                                    <option value={"false"} className="currency_select">
                                        {farm.name}
                                    </option>
                                    <option value={"true"} className="currency_select">
                                        USD
                                    </option>
                                </select>
                                <p className={`deposit_max ${lightMode && "deposit_max--light"}`} onClick={maxDeposit}>
                                    MAX
                                </p>
                            </div>

                            <div className={`deposit_deposits ${lightMode && "deposit_deposits--light"}`}>
                                {!lpDepositAmount || lpDepositAmount <= 0 ? (
                                    <button
                                        className={`deposit_zap1_button_disable ${
                                            lightMode && "deposit_zap1_button_disable--light"
                                        }`}
                                    >
                                        <p>Deposit</p>
                                    </button>
                                ) : lpDepositAmount > maxBalance ? (
                                    <button
                                        className={`deposit_zap1_button_disable ${
                                            lightMode && "deposit_zap1_button_disable--light"
                                        }`}
                                    >
                                        <p>Insufficient Balance</p>
                                    </button>
                                ) : (
                                    <button
                                        className={`deposit_zap_button ${lightMode && "deposit_zap_button--light"}`}
                                        onClick={depositAmount}
                                        disabled={isLoading}
                                    >
                                        <p>Deposit</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {currentWallet ? null : (
                        <div className={`no_overlay ${!currentWallet && "overlay"}`} onClick={connectWallet}>
                            <p>connect wallet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
