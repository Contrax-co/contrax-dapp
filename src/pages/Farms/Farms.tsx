import { useEffect, useState } from "react";
import useApp from "src/hooks/useApp";
import useFarms from "src/hooks/farms/useFarms";
import FarmRow from "src/components/FarmItem/FarmRow";
import { FarmData, FarmDataExtended } from "src/types";
import { FarmSortOptions, FarmTableColumns } from "src/types/enums";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import useWallet from "src/hooks/useWallet";
import { IS_LEGACY } from "src/config/constants";
import { useFarmApys } from "src/hooks/farms/useFarmApy";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import "./Farms.css";
import styles from "./Farms.module.scss";
import { VaultsWithFundsToggle } from "./components/VaultsWithFundsToggle";
import InfoText from "src/components/InfoText/InfoText";
import { platformNames, PoolDef } from "src/config/constants/pools_json";
import { FaSort } from "react-icons/fa6";
import { TbArrowsSort } from "react-icons/tb";
import SortPopup from "./components/SortPopup";
import OutsideClickHandler from "react-outside-click-handler";
import FarmRowChip from "src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import useEarnPage from "src/hooks/farms/useEarnPage";

function Farms() {
    const { lightMode } = useApp();
    const [openedFarm, setOpenedFarm] = useState<number | undefined>();
    const [sortPopup, setSortPopup] = useState(false);
    const { sortedFarms, farms, selectedPlatform, setSelectedPlatform, setSortSelected, sortSelected } = useEarnPage();

    return (
        <div className={`farms ${lightMode && "farms--light"}`}>
            <div className={`farm_header ${lightMode && "farm_header--light"}`}>
                <p>Earn</p>
                {IS_LEGACY && <VaultsWithFundsToggle />}
            </div>
            <div className={styles.protocols_div}>
                <h6>Available Protocols:</h6>
                <div className={styles.protocols_container}>
                    {platformNames.map((item, i) => (
                        <div
                            key={i}
                            className={`${styles.protocol_wrapper} ${
                                selectedPlatform === item.name && styles.selected_protocol_wrapper
                            }`}
                            onClick={() =>
                                selectedPlatform === item.name
                                    ? setSelectedPlatform(null)
                                    : setSelectedPlatform(item.name)
                            }
                        >
                            <h6>{item.name}</h6>
                            <p>Pools: {item.count}</p>
                            <img src={item.logo} className={styles.protocol_logo} />
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ marginBottom: 10, display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ position: "relative", width: "fit-content" }}>
                    <OutsideClickHandler display="inline-block" onOutsideClick={() => setSortPopup(false)}>
                        <button onClick={() => setSortPopup(true)} className={styles.sortBtn}>
                            <TbArrowsSort /> Sort by
                        </button>
                        {sortPopup && (
                            <SortPopup
                                sortSelected={sortSelected}
                                setSortSelected={(v) => {
                                    setSortSelected(v);
                                    setSortPopup(false);
                                }}
                            />
                        )}
                    </OutsideClickHandler>
                </div>
                {sortSelected !== FarmSortOptions.Default && (
                    <div style={{ position: "relative", width: "fit-content" }}>
                        <FarmRowChip text={sortSelected} />
                    </div>
                )}
            </div>
            {/* <div className={`farm_table_header ${lightMode && "farm_table_header_light"} ${styles.table_header}`}>
                <p className="item_asset" style={{ marginLeft: 20 }}>
                    {FarmTableColumns.Token}
                </p>
                <p
                    onClick={() => {
                        setSortedBuy(FarmTableColumns.APY);
                        setDecOrder((prev) => !prev);
                    }}
                >
                    <span>{FarmTableColumns.APY}</span>
                    {sortedBuy === FarmTableColumns.APY ? (
                        decOrder ? (
                            <RiArrowDownSLine fontSize={21} />
                        ) : (
                            <RiArrowUpSLine fontSize={21} />
                        )
                    ) : null}
                </p>
                <p
                    onClick={() => {
                        if (currentWallet) {
                            setSortedBuy(FarmTableColumns.Deposited);
                            setDecOrder((prev) => !prev);
                        }
                    }}
                    className={`header_deposite`}
                >
                    <span>{FarmTableColumns.Deposited}</span>
                    {sortedBuy === FarmTableColumns.Deposited ? (
                        decOrder ? (
                            <RiArrowDownSLine fontSize={21} />
                        ) : (
                            <RiArrowUpSLine fontSize={21} />
                        )
                    ) : null}
                </p>
                <p></p>
            </div> */}
            <p className="type_heading">{FarmTableColumns.Token}</p>
            {sortedFarms
                ? sortedFarms
                      .filter((farm) => (IS_LEGACY ? farm.isDeprecated : !farm.isDeprecated))
                      .map((farm, index) => (
                          <FarmRow
                              key={index + "nowallet"}
                              farm={farm}
                              openedFarm={openedFarm}
                              setOpenedFarm={setOpenedFarm}
                          />
                      ))
                : farms
                      .filter((farm) => (IS_LEGACY ? farm.isDeprecated : !farm.isDeprecated))
                      .map((farm, index) => (
                          <FarmRow
                              key={index + "nowallet"}
                              farm={farm}
                              openedFarm={openedFarm}
                              setOpenedFarm={setOpenedFarm}
                          />
                      ))}

            {!IS_LEGACY && (
                <>
                    <InfoText
                        style={{ marginTop: 20 }}
                        text={
                            "Vaults in advanced section are subject to impermanent loss risk. Use at your own discretion."
                        }
                    />
                    <div style={{ textAlign: "center" }}>
                        <small>
                            Can't find your vault? It might have been deprecated. You can withdraw from old vaults
                            here&nbsp;
                            <a href="https://legacy.contrax.finance">Click Here</a>
                        </small>
                    </div>
                </>
            )}
        </div>
    );
}

export default Farms;
