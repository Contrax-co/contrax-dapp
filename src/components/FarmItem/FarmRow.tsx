import React, { useState, useEffect, useMemo } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import "./FarmRow.css";
import { CgInfo } from "react-icons/cg";
import { Tooltip } from "react-tooltip";
import useApp from "src/hooks/useApp";
import uuid from "react-uuid";
import { Farm } from "src/types";
import { toFixedFloor } from "src/utils/common";
import { Skeleton } from "../Skeleton/Skeleton";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import useFarmApy from "src/hooks/farms/useFarmApy";
import { DropDownView } from "./components/DropDownView/DropDownView";
import { DeprecatedChip } from "./components/Chip/DeprecatedChip";
import { useAppDispatch, useAppSelector } from "src/state";
import fire from "src/assets/images/fire.png";
import { setFarmDetailInputOptions } from "src/state/farms/farmsReducer";
import { FarmTransactionType } from "src/types/enums";
import useTrax from "src/hooks/useTrax";
import { IS_LEGACY } from "src/config/constants";

const xTraxTokenomics = "https://contraxfi.medium.com/contrax-initial-tokenomics-837d062596a4";
interface Props {
    farm: Farm;
    openedFarm: number | undefined;
    setOpenedFarm: Function;
}

const FarmRow: React.FC<Props> = ({ farm, openedFarm, setOpenedFarm }) => {
    const { lightMode } = useApp();
    const [dropDown, setDropDown] = useState(false);
    const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
    const { farmDetails, isLoading: isFarmLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];
    const isLoading = isFarmLoading || isApyLoading;
    const key = uuid();
    const key2 = uuid();
    const key3 = uuid();
    const key4 = uuid();
    const dispatch = useAppDispatch();
    const { getTraxApy } = useTrax();
    const showVaultsWithFunds = useAppSelector((state) => state.settings.showVaultsWithFunds);

    const estimateTrax = useMemo(() => getTraxApy(farm.vault_addr), [getTraxApy, farm]);

    const handleClick = (e: any) => {
        // if (e.target.tagName === "svg" || e.target.tagName === "path") {
        //     // Clicked for tooltip
        // } else {
        setDropDown((prev) => !prev);
        dispatch(setFarmDetailInputOptions({ transactionType: FarmTransactionType.Deposit }));
        if (farm) setOpenedFarm(openedFarm === farm.id ? undefined : farm.id);
        // }
    };

    useEffect(() => {
        if (openedFarm !== farm?.id && dropDown) setDropDown(false);
        // if(!dropDown && openedFarm === farm?.id) setOpenedFarm(undefined)
    }, [openedFarm, dropDown, farm?.id]);

    if (isLoading) return <FarmRowSkeleton farm={farm} lightMode={lightMode} />;

    if (showVaultsWithFunds && parseFloat(farmData?.withdrawableAmounts[0].amountDollar || "0") < 0.01) return null;

    return (
        <div className={`farm_table_pool ${lightMode && "farm_table_pool_light"}`}>
            <div className="farm_table_row" key={farm?.id} onClick={handleClick}>
                {farm.isDeprecated && <DeprecatedChip top="20px" right="26px" />}

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
                        {farmApys && toFixedFloor(farmApys?.apy || 0, 2) == 0 ? (
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>--</p>
                        ) : (
                            <div className={"innerContainer"}>
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
                                            farmApys && parseFloat(farmApys.rewardsApr.toString())
                                                ? `<p>Compounding Rewards: ${toFixedFloor(
                                                      farmApys.rewardsApr + farmApys.compounding,
                                                      3
                                                  )}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys && parseFloat(farmApys.feeApr.toString())
                                                ? `<p>Trading Fees: ${toFixedFloor(farmApys.feeApr, 3)}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys.boost && parseFloat(farmApys.boost.toString())
                                                ? `<p>Apy Boost: ${toFixedFloor(farmApys.boost, 3)}%</p>`
                                                : ``
                                        }
                                        `}
                                >
                                    <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                                </a>
                                <Tooltip
                                    anchorId={key}
                                    className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                                />
                            </div>
                        )}
                        <a
                            id={key3}
                            data-tooltip-html={
                                estimateTrax
                                    ? estimateTrax !== "0"
                                        ? `<p>
                                    Pre-farm rate: <b>${estimateTrax}</b> xTRAX<br/>
                            <a href="${xTraxTokenomics}" target="_blank">Click to learn more </a>
                                        </p>
                                        `
                                        : `<p>xTrax rate will soon be available<br/>
                                        <a href="${xTraxTokenomics}" target="_blank">Click to learn more </a></p>`
                                    : `<p>
                                    Stake to earn xTRAX. <br/>
                            <a href="${xTraxTokenomics}" target="_blank">Click to learn more </a></p>`
                            }
                        >
                            <div className={"xTranxBoosted"} onClick={() => window.open(xTraxTokenomics, "_blank")}>
                                {/* <img src={fire} alt="fire" /> */}
                                <p className={"paraxTrax"}>xTRAX Boosted!</p>
                            </div>
                        </a>
                        <Tooltip
                            anchorId={key3}
                            clickable
                            place="bottom"
                            className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                        />
                    </div>
                </div>

                {/* How much the user has deposited */}

                <div className={`container ${lightMode && "container--light"} desktop`}>
                    {farmData &&
                    farmData.withdrawableAmounts.find((_) => _.isPrimaryVault)?.amountDollar &&
                    parseFloat(farmData.withdrawableAmounts[0].amountDollar) >= 0.01 ? (
                        <>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {parseFloat(
                                    farmData.withdrawableAmounts.find((_) => _.isPrimaryVault)?.amountDollar || "0"
                                )
                                    .toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 3,
                                    })
                                    .slice(0, -1)}
                            </p>
                            <p className={`deposited ${lightMode && "deposited--light"}`}>
                                {toFixedFloor(
                                    parseFloat(
                                        farmData.withdrawableAmounts.find((_) => _.isPrimaryVault)?.amount || "0"
                                    ),
                                    10
                                ).toString()}
                                &nbsp;{farm?.name}
                            </p>
                        </>
                    ) : null}
                </div>

                {/* Mobile View */}

                {/* APY */}

                <div className={`container1 ${lightMode && "container1--light"} apy mobile-view`}>
                    <p className={`pool_name pool_name_head ${lightMode && "pool_name--light"}`}>APY</p>
                    {farmApys && toFixedFloor(farmApys?.apy || 0, 2) == 0 ? (
                        <p className={`pool_name ${lightMode && "pool_name--light"}`}>--</p>
                    ) : (
                        <>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {farmApys && farmApys.apy < 0.01
                                    ? farmApys.apy.toPrecision(2).slice(0, -1)
                                    : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                                %
                                <a
                                    id={key2}
                                    data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        ${
                                            farmApys && parseFloat(farmApys.rewardsApr.toString())
                                                ? `<p>Compounding Rewards: ${toFixedFloor(
                                                      farmApys.rewardsApr + farmApys.compounding,
                                                      3
                                                  )}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys && parseFloat(farmApys.feeApr.toString())
                                                ? `<p>Trading Fees: ${toFixedFloor(farmApys.feeApr, 3)}%</p>`
                                                : ``
                                        }
                                        ${
                                            farmApys.boost && parseFloat(farmApys.boost.toString())
                                                ? `<p>Apy Boost: ${toFixedFloor(farmApys.boost, 3)}%</p>`
                                                : ``
                                        }
                                        `}
                                >
                                    <CgInfo
                                        className={`apy_info hoverable ${lightMode && "apy_info--light"}`}
                                        style={{ transform: "translateY(2px)" }}
                                    />
                                </a>
                                <Tooltip
                                    anchorId={key2}
                                    className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                                />
                            </p>
                            <a
                                id={key4}
                                data-tooltip-html={
                                    estimateTrax
                                        ? estimateTrax !== "0"
                                            ? `<p>
                                        Pre-farm rate: <b>${estimateTrax}</b> xTRAX<br/>
                            <a href="${xTraxTokenomics}" target="_blank">Click to learn more </a>
                                        </p>
                                        `
                                            : `<p>xTrax rate will soon be available<br/><a href="${xTraxTokenomics}" target="_blank">Click to learn more </a></p>`
                                        : `<p>
                                        Stake to earn xTRAX. <br/>
                                <a href="${xTraxTokenomics}" target="_blank">Click to learn more </a></p>`
                                }
                            >
                                <div className={"xTranxBoosted"} onClick={() => window.open(xTraxTokenomics, "_blank")}>
                                    {/* <img src={fire} alt="fire" /> */}
                                    <p className={"paraxTrax"}>xTRAX Boosted!</p>
                                </div>
                            </a>
                            <Tooltip
                                anchorId={key4}
                                place="bottom"
                                clickable
                                className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                            />
                        </>
                    )}
                </div>

                <div className={`mobile-view ${lightMode && "mobile-view--light"}`}>
                    {/* How much the user has deposited */}

                    {farmData &&
                    farmData.withdrawableAmounts[0].amountDollar &&
                    parseFloat(farmData.withdrawableAmounts[0].amountDollar) >= 0.01 ? (
                        <div className={`container ${lightMode && "container--light"} deposite`}>
                            <p className={`pool_name pool_name_head ${lightMode && "pool_name--light"}`}>Deposited</p>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {parseFloat(farmData?.withdrawableAmounts[0].amountDollar || "0")
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
                        farmData.Withdrawable_Amounts[0].amountDollar &&
                        parseFloat(farmData.Withdrawable_Amounts[0].amountDollar) >= 0.01 ? (
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

const FarmRowSkeleton = ({ farm, lightMode }: { farm: Farm; lightMode: boolean }) => {
    const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
    const key = uuid();
    const { farmDetails, isLoading: isFarmLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];

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
