import { useState, useEffect, useMemo } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import "./CompoundItem.css";
import Deposit from "src/components/DepositPool/DepositPool";
import PoolButton from "src/components/PoolButton/PoolButton";
import Withdraw from "src/components/WithdrawPool/WithdrawPool";
import { CgInfo } from "react-icons/cg";
import { Tooltip } from "react-tooltip";
import Details from "src/components/CompoundItem/Details";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import uuid from "react-uuid";
import { Farm } from "src/types";
import useFarmsVaultBalances from "src/hooks/farms/useFarmsVaultBalances";
import useFarmsVaultTotalSupply from "src/hooks/farms/useFarmsVaultTotalSupply";
import usePriceOfToken from "src/hooks/usePriceOfToken";
import { calculateFarmAPY, findCompoundAPY, findTotalAPY, totalFarmAPY } from "src/utils/common";
import useFarmApy from "src/hooks/farms/useFarmApy";
import useFeeApy from "src/hooks/useFeeApy";

interface Props {
    farm: Farm;
}

const CompoundItem: React.FC<Props> = ({ farm }) => {
    const { lightMode } = useApp();
    const [dropdown, setDropDown] = useState(false);
    const [buttonType, setButtonType] = useState("Deposit");

    const { formattedBalances } = useFarmsVaultBalances();
    const userVaultBal = useMemo(() => {
        return formattedBalances[farm.vault_addr] || 0;
    }, [formattedBalances, farm]);

    const { formattedSupplies } = useFarmsVaultTotalSupply();
    const totalVaultBalance = useMemo(() => {
        return formattedSupplies[farm.vault_addr];
    }, [formattedSupplies, farm]);

    const { price: priceOfSingleToken } = usePriceOfToken(farm.lp_address);

    const [details, setDetails] = useState(false);
    const { apy: rewardAPY } = useFarmApy(farm.lp_address);
    const { apy: feeAPY } = useFeeApy(farm.lp_address);

    const apyVisionCompound = useMemo(() => calculateFarmAPY(rewardAPY), [rewardAPY]);
    const compoundAPY = useMemo(
        () => findCompoundAPY(farm.rewards_apy || 0, farm.total_apy || 0, farm.platform),
        [farm]
    );

    const totalAPY = useMemo(() => findTotalAPY(farm.rewards_apy || 0, farm.total_apy || 0, farm.platform), [farm]);
    const apyVisionAPY = useMemo(() => totalFarmAPY(rewardAPY, feeAPY), [rewardAPY, feeAPY]);

    const key = uuid();

    return (
        <div className={`pools ${lightMode && "pools--light"}`}>
            <div className="single_pool" key={farm.id} onClick={() => setDropDown(!dropdown)}>
                <div className="row_items">
                    <div className="title_container">
                        <div className="pair">
                            {farm.logo1 ? (
                                <img
                                    alt={farm.alt1}
                                    className={`logofirst ${lightMode && "logofirst--light"}`}
                                    src={farm.logo1}
                                />
                            ) : null}

                            {farm.logo2 ? (
                                <img
                                    alt={farm.alt2}
                                    className={`logo ${lightMode && "logo--light"}`}
                                    src={farm.logo2}
                                />
                            ) : null}
                        </div>

                        <div>
                            <div className="pool_title">
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>{farm.name}</p>
                                <div className="rewards_div">
                                    <p className={`farm_type ${lightMode && "farm_type--light"}`}>{farm.platform}</p>
                                    <img alt={farm.platform_alt} className="rewards_image" src={farm.platform_logo} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How much the user has deposited */}

                    {userVaultBal * priceOfSingleToken < 0.01 ? (
                        <div className={`container ${lightMode && "container--light"}`}>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}></p>
                            <p className={`tvlLP ${lightMode && "tvlLP--light"}`}></p>
                        </div>
                    ) : (
                        <div className={`container ${lightMode && "container--light"}`}>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {(userVaultBal * priceOfSingleToken).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                            <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>{userVaultBal.toFixed(10)}</p>
                        </div>
                    )}

                    <div className="pool_info">
                        <div className={`container__apy ${lightMode && "container__apy--light"}`}>
                            {userVaultBal * priceOfSingleToken < 0.01 ? (
                                <p className={`pool_name__apy ${lightMode && "pool_name__apy--light"}`}></p>
                            ) : (
                                <p className={`pool_name__apy ${lightMode && "pool_name__apy--light"}`}>
                                    {((userVaultBal / totalVaultBalance) * 100).toFixed(2)} %
                                </p>
                            )}
                        </div>

                        {totalVaultBalance * priceOfSingleToken < 0.01 ? (
                            <div className={`container ${lightMode && "container--light"}`}>
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                    {(0).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    })}
                                </p>

                                <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>0</p>
                            </div>
                        ) : (
                            <div className={`container ${lightMode && "container--light"}`}>
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                    {(totalVaultBalance * priceOfSingleToken).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    })}
                                </p>

                                <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>
                                    {totalVaultBalance.toFixed(10)}
                                </p>
                            </div>
                        )}

                        <div className={`container1 ${lightMode && "container1--light"}`}>
                            {!farm.total_apy ? (
                                <div className={`container1_apy ${lightMode && "container1_apy--light"}`}>
                                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                        {apyVisionAPY.toFixed(2)}%
                                    </p>
                                    <a
                                        id={key}
                                        data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        <p>LP Rewards: ${rewardAPY.toFixed(2)}%</p>
                                        <p>Trading Fees: ${feeAPY.toFixed(2)}%</p>
                                        <p>Compounding: ${apyVisionCompound.toFixed(2)}%</p>`}
                                    >
                                        <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                                    </a>
                                    <Tooltip
                                        anchorId={key}
                                        className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                                    />
                                </div>
                            ) : (
                                <div className={`container1_apy ${lightMode && "container1_apy--light"}`}>
                                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                        {totalAPY.toFixed(2)}%
                                    </p>
                                    <a
                                        id={key}
                                        data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        <p>LP Rewards: ${Number(farm.rewards_apy).toFixed(2)}%</p>
                                        <p>Compounding: ${compoundAPY.toFixed(2)}%</p>`}
                                    >
                                        <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                                    </a>
                                    <Tooltip
                                        anchorId={key}
                                        className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`dropdown ${lightMode && "dropdown--light"}`}>
                        {dropdown === false ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
                    </div>
                </div>
            </div>

            {dropdown === false ? null : (
                <div className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>
                    <div className="drop_buttons">
                        <PoolButton
                            onClick={() => setButtonType("Deposit")}
                            description="deposit"
                            active={buttonType === "Deposit"}
                        />
                        <PoolButton
                            onClick={() => setButtonType("Withdraw")}
                            description="withdraw"
                            active={buttonType === "Withdraw"}
                        />
                    </div>

                    {buttonType === "Deposit" && <Deposit farm={farm} />}

                    {buttonType === "Withdraw" && <Withdraw farm={farm} />}

                    {details === false ? (
                        <div
                            className={`see_details_dropdown ${lightMode && "see_details_dropdown--light"}`}
                            onClick={() => setDetails(true)}
                        >
                            <p className={`see_details_description ${lightMode && "see_details_description--light"}`}>
                                See more details
                            </p>
                            <RiArrowDownSLine />
                        </div>
                    ) : (
                        <Details farm={farm} onClick={() => setDetails(false)} />
                    )}
                </div>
            )}
        </div>
    );
};

export default CompoundItem;
