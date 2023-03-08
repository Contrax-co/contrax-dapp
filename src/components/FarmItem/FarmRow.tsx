import React, { useState, useEffect } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import "./FarmRow.css";
import PoolButton from "src/components/PoolButton/PoolButton";
import { CgInfo } from "react-icons/cg";
import { Tooltip } from "react-tooltip";
import Details from "src/components/FarmItem/Details";
import useApp from "src/hooks/useApp";
import uuid from "react-uuid";
import { Farm } from "src/types";
import DetailInput from "./components/DetailInput";
import { FarmTransactionType } from "src/types/enums";
import { toFixedFloor } from "src/utils/common";
import { Skeleton } from "../Skeleton/Skeleton";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import useFarmApy from "src/hooks/farms/useFarmApy";

interface Props {
    farm: Farm;
    openedFarm: number | undefined;
    setOpenedFarm: Function;
}

const FarmRow: React.FC<Props> = ({ farm, openedFarm, setOpenedFarm }) => {
    const { lightMode } = useApp();
    const [dropDown, setDropDown] = useState(false);
    const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
    const { farmData, isLoading: isFarmLoading } = useFarmDetails(farm);
    const isLoading = isFarmLoading || isApyLoading;
    const key = uuid();

    const handleClick = () => {
        setDropDown((prev) => !prev);
        if (farm) setOpenedFarm(openedFarm === farm.id ? undefined : farm.id);
    };

    useEffect(() => {
        if (openedFarm !== farm?.id && dropDown) setDropDown(false);
        // if(!dropDown && openedFarm === farm?.id) setOpenedFarm(undefined)
    }, [openedFarm, dropDown, farm?.id]);

    return isLoading ? (
        <FarmRowSkeleton farm={farm} lightMode={lightMode} />
    ) : (
        <div className={`farm_table_pool ${lightMode && "farm_table_pool_light"}`}>
            <div className="farm_table_row" key={farm?.id} onClick={handleClick}>
                {/* Asset Name and Logo */}

                <div className="title_container">
                    <div className="pair">
                        {farm?.logo1 ? (
                            <img
                                alt={farm?.alt1}
                                className={`logofirst ${lightMode && "logofirst--light"}`}
                                src={farm?.logo1}
                            />
                        ) : null}

                        {farm?.logo2 ? (
                            <img alt={farm?.alt2} className={`logo ${lightMode && "logo--light"}`} src={farm?.logo2} />
                        ) : null}
                    </div>

                    <div>
                        <div className="pool_title">
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>{farm?.name}</p>
                            <div className="rewards_div">
                                <p className={`farm_type ${lightMode && "farm_type--light"}`}>{farm?.platform}</p>
                                <img alt={farm?.platform_alt} className="rewards_image" src={farm?.platform_logo} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* APY */}

                <div className={`container1 ${lightMode && "container1--light"} desktop`}>
                    <div className={`container1_apy ${lightMode && "container1_apy--light"}`}>
                        <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                            {farmApys && farmApys.apy < 0.01
                                ? farmApys.apy.toPrecision(2).slice(0, -1)
                                : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                            %
                        </p>
                        <a
                            id={key}
                            data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        ${
                                            farmApys && Number(farmApys.rewardsApr.toFixed(3))
                                                ? `<p>LP Rewards: ${farmApys.rewardsApr.toFixed(3)}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys && Number(farmApys.feeApr.toFixed(2))
                                                ? `<p>Trading Fees: ${farmApys.feeApr.toFixed(3)}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys && Number(farmApys.compounding.toFixed(3))
                                                ? `<p>Compounding: ${farmApys.compounding.toFixed(3)}%</p>`
                                                : ``
                                        }`}
                        >
                            <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                        </a>
                        <Tooltip anchorId={key} className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`} />
                    </div>
                </div>

                {/* How much the user has deposited */}

                <div className={`container ${lightMode && "container--light"} desktop`}>
                    {farmData &&
                    farmData.Max_Token_Withdraw_Balance_Dollar &&
                    parseFloat(farmData.Max_Token_Withdraw_Balance_Dollar) >= 0.01 ? (
                        <>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {parseFloat(farmData?.Max_Token_Withdraw_Balance_Dollar || "0")
                                    .toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 3,
                                    })
                                    .slice(0, -1)}
                            </p>
                            <p className={`deposited ${lightMode && "deposited--light"}`}>
                                {toFixedFloor(parseFloat(farmData?.Max_Token_Withdraw_Balance || "0"), 10).toString()}
                                &nbsp;{farm?.name}
                            </p>
                        </>
                    ) : null}
                </div>

                {/* How much the user has Earned */}

                {/* <div className={`container1 ${lightMode && "container1--light"} desktop`}>
                    {farmData &&
                    farmData.Max_Token_Withdraw_Balance_Dollar &&
                    parseFloat(farmData.Max_Token_Withdraw_Balance_Dollar) >= 0.01 ? (
                        <p className={`pool_name ${lightMode && "pool_name--light"}`}>NA</p>
                    ) : null}
                </div> */}

                {/* Mobile View */}

                {/* APY */}

                <div className={`container1 ${lightMode && "container1--light"} apy mobile-view`}>
                    <p className={`pool_name pool_name_head ${lightMode && "pool_name--light"}`}>APY</p>
                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                        {farmApys && farmApys.apy < 0.01
                            ? farmApys.apy.toPrecision(2).slice(0, -1)
                            : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                        %
                    </p>
                </div>

                <div className={`mobile-view ${lightMode && "mobile-view--light"}`}>
                    {/* How much the user has deposited */}

                    {farmData &&
                    farmData.Max_Token_Withdraw_Balance_Dollar &&
                    parseFloat(farmData.Max_Token_Withdraw_Balance_Dollar) >= 0.01 ? (
                        <div className={`container ${lightMode && "container--light"} deposite`}>
                            <p className={`pool_name pool_name_head ${lightMode && "pool_name--light"}`}>Deposited</p>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {parseFloat(farmData?.Max_Token_Withdraw_Balance_Dollar || "0")
                                    .toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 3,
                                    })
                                    .slice(0, -1)}
                            </p>
                        </div>
                    ) : null}

                    {/* How much the user has Earned */}

                    {/* <div className={`container1 ${lightMode && "container1--light"} earned`}>
                        {farmData &&
                        farmData.Max_Token_Withdraw_Balance_Dollar &&
                        parseFloat(farmData.Max_Token_Withdraw_Balance_Dollar) >= 0.01 ? (
                            <>
                                <p className={`pool_name pool_name_head ${lightMode && "pool_name--light"}`}>Earned</p>
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>NA</p>
                            </>
                        ) : null}
                    </div> */}
                </div>

                <div className={`dropdown ${lightMode && "dropdown--light"}`}>
                    {!dropDown ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
                </div>
            </div>
            {dropDown && <DropDownView farm={farm} />}
        </div>
    );
};

export default FarmRow;

const DropDownView: React.FC<{ farm: Farm }> = ({ farm }) => {
    const { lightMode } = useApp();
    const [transactionType, setTransactionType] = useState<FarmTransactionType>(FarmTransactionType.Deposit);
    const [showMoreDetail, setShowMoreDetail] = useState(false);
    const [shouldUseLp, setShouldUseLp] = useState(
        farm.token_type === "LP Token" || farm.name === "ETH" ? false : true
    );

    return (
        <div className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>
            <div className="drop_buttons">
                <PoolButton
                    onClick={() => setTransactionType(FarmTransactionType.Deposit)}
                    description={FarmTransactionType.Deposit}
                    active={transactionType === FarmTransactionType.Deposit}
                />
                <PoolButton
                    onClick={() => setTransactionType(FarmTransactionType.Withdraw)}
                    description={FarmTransactionType.Withdraw}
                    active={transactionType === FarmTransactionType.Withdraw}
                />
            </div>

            <DetailInput farm={farm} shouldUseLp={shouldUseLp} type={transactionType} />

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

const FarmRowSkeleton = ({ farm, lightMode }: { farm: Farm; lightMode: boolean }) => {
    const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
    const key = uuid();
    const { farmData, isLoading: isFarmLoading } = useFarmDetails(farm);

    return (
        <div className={`farm_table_pool ${lightMode && "farm_table_pool_light"}`}>
            <div className="farm_table_row">
                {/* Asset Name and Logo */}

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

                {/* APY */}
                {isApyLoading ? (
                    <div className={`container ${lightMode && "container--light"} desktop`}>
                        <Skeleton w={50} h={30} />
                    </div>
                ) : (
                    <div className={`container1 ${lightMode && "container1--light"} desktop`}>
                        <div className={`container1_apy ${lightMode && "container1_apy--light"}`}>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {farmApys && farmApys.apy < 0.01
                                    ? farmApys.apy.toPrecision(2).slice(0, -1)
                                    : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                                %
                            </p>
                            <a
                                id={key}
                                data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        ${
                                            farmApys && Number(farmApys.rewardsApr.toFixed(3))
                                                ? `<p>LP Rewards: ${farmApys.rewardsApr.toFixed(3)}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys && Number(farmApys.feeApr.toFixed(2))
                                                ? `<p>Trading Fees: ${farmApys.feeApr.toFixed(3)}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys && Number(farmApys.compounding.toFixed(3))
                                                ? `<p>Compounding: ${farmApys.compounding.toFixed(3)}%</p>`
                                                : ``
                                        }`}
                            >
                                <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                            </a>
                            <Tooltip anchorId={key} className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`} />
                        </div>
                    </div>
                )}

                {/* How much the user has deposited */}
                <div className={`container ${lightMode && "container--light"} desktop`}>
                    {!farmData && <Skeleton w={50} h={30} />}
                </div>

                {/* How much the user has Earned */}

                {/* <div className={`container1 ${lightMode && "container1--light"} desktop`}>
                    {isFarmLoading && <Skeleton w={50} h={30} />}
                </div> */}

                {/* Mobile View */}

                {/* APY */}

                <div className={`container1 ${lightMode && "container1--light"} apy mobile-view`}>
                    {isApyLoading ? (
                        <Skeleton w={50} h={30} />
                    ) : (
                        <div className={`container1 ${lightMode && "container1--light"} apy`}>
                            <p className={`pool_name pool_name_head ${lightMode && "pool_name--light"}`}>APY</p>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {farmApys && farmApys.apy < 0.01
                                    ? farmApys.apy.toPrecision(2).slice(0, -1)
                                    : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                                %
                            </p>
                        </div>
                    )}
                </div>

                <div className={`mobile-view ${lightMode && "mobile-view--light"}`}>
                    {/* How much the user has deposited */}

                    <div className={`container ${lightMode && "container--light"} deposite`}>
                        {isFarmLoading && <Skeleton w={50} h={30} />}
                    </div>

                    {/* How much the user has Earned */}

                    {/* <div className={`container1 ${lightMode && "container1--light"} earned`}>
                        {isFarmLoading && <Skeleton w={50} h={30} />}
                    </div> */}
                </div>

                <div className={`dropdown ${lightMode && "dropdown--light"}`}>
                    {isFarmLoading && <Skeleton w={20} h={20} />}
                </div>
            </div>
        </div>
    );
};
