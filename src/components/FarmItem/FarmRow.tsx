import React, { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import "./FarmRow.css";
import PoolButton from "src/components/PoolButton/PoolButton";
import { CgInfo } from "react-icons/cg";
import { Tooltip } from "react-tooltip";
import Details from "src/components/FarmItem/Details";
import useApp from "src/hooks/useApp";
import uuid from "react-uuid";
import { FarmDetails } from "src/types";
import DetailInput from "./components/DetailInput";
import { FarmTransactionType } from "src/types/enums";

interface Props {
    farm: FarmDetails;
}

const FarmRow: React.FC<Props> = ({ farm }) => {
    const { lightMode } = useApp();
    const [dropdown, setDropDown] = useState(false);
    const { userVaultBal, priceOfSingleToken, apys } = farm;
    const { compounding, feeApr, rewardsApr, apy } = apys;
    const key = uuid();

    return (
        <div className={`farm_table_pool ${lightMode && "farm_table_pool_light"}`}>
            <div className="farm_table_row" key={farm.id} onClick={() => setDropDown(!dropdown)}>
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
                            <img alt={farm.alt2} className={`logo ${lightMode && "logo--light"}`} src={farm.logo2} />
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
                        <p className={`deposited ${lightMode && "deposited--light"}`}></p>
                    </div>
                ) : (
                    <div className={`container ${lightMode && "container--light"}`}>
                        <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                            {(userVaultBal * priceOfSingleToken).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                            })}
                        </p>
                        <p className={`deposited ${lightMode && "deposited--light"}`}>
                            {userVaultBal.toFixed(10)}
                            &nbsp;{farm.name}
                        </p>
                    </div>
                )}

                <div className={`container1 ${lightMode && "container1--light"}`}>
                    <div className={`container1_apy ${lightMode && "container1_apy--light"}`}>
                        <p className={`pool_name ${lightMode && "pool_name--light"}`}>{apy.toFixed(2)}%</p>
                        <a
                            id={key}
                            data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        ${
                                            Number(rewardsApr.toFixed(2))
                                                ? `<p>LP Rewards: ${rewardsApr.toFixed(2)}%</p>`
                                                : ``
                                        }
                                        ${Number(feeApr.toFixed(2)) ? `<p>Trading Fees: ${feeApr.toFixed(2)}%</p>` : ``}
                                        ${
                                            Number(compounding.toFixed(2))
                                                ? `<p>Compounding: ${compounding.toFixed(2)}%</p>`
                                                : ``
                                        }`}
                        >
                            <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                        </a>
                        <Tooltip anchorId={key} className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`} />
                    </div>
                </div>

                <div className={`dropdown ${lightMode && "dropdown--light"}`}>
                    {!dropdown ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
                </div>
            </div>
            {dropdown && <DropDownView farm={farm} />}
        </div>
    );
};

export default FarmRow;

const DropDownView: React.FC<{ farm: FarmDetails }> = ({ farm }) => {
    const { lightMode } = useApp();
    const [tab, setTab] = useState(1);
    const [showMoreDetail, setShowMoreDetail] = useState(false);
    const [shouldUseLp, setShouldUseLp] = useState(farm.token_type === "LP Token" ? false : true);

    return (
        <div className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>
            <div className="drop_buttons">
                <PoolButton onClick={() => setTab(1)} description="Deposit" active={tab === 1} />
                <PoolButton onClick={() => setTab(2)} description="Withdraw" active={tab === 2} />
            </div>

            {tab === 1 && <DetailInput farm={farm} shouldUseLp={shouldUseLp} type={FarmTransactionType.Deposit} />}
            {/* {tab === 1 && <Deposit farm={farm} shouldUseLp={shouldUseLp} setShouldUseLp={setShouldUseLp} />} */}

            {tab === 2 && <DetailInput farm={farm} shouldUseLp={shouldUseLp} type={FarmTransactionType.Withdraw} />}

            {!showMoreDetail ? (
                <div
                    className={`see_details_dropdown ${lightMode && "see_details_dropdown--light"}`}
                    onClick={() => setShowMoreDetail(true)}
                >
                    <p className={`see_details_description ${lightMode && "see_details_description--light"}`}>
                        See more details
                    </p>
                    <RiArrowDownSLine />
                </div>
            ) : (
                <Details
                    farm={farm}
                    onClick={() => setShowMoreDetail(false)}
                    shouldUseLp={shouldUseLp}
                    setShouldUseLp={setShouldUseLp}
                />
            )}
        </div>
    );
};
