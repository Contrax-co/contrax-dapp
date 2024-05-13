import { useEffect, useState } from "react";
import useApp from "src/hooks/useApp";
import useFarms from "src/hooks/farms/useFarms";
import FarmRow from "src/components/FarmItem/FarmRow";
import { Farm, FarmData } from "src/types";
import { FarmTableColumns } from "src/types/enums";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import useWallet from "src/hooks/useWallet";
import { IS_LEGACY, defaultChainId, isDev } from "src/config/constants";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { useFarmApys } from "src/hooks/farms/useFarmApy";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import "./Farms.css";
import DotMenu from "./components/DotMenu";
import { DeprecatedToggle } from "./components/DeprecatedToggle";
import InfoText from "src/components/InfoText/InfoText";

interface FarmDataExtended extends Partial<Omit<FarmData, "id">>, Farm {
    apy: number;
}
function Farms() {
    const { lightMode } = useApp();
    const { farms } = useFarms();
    const { networkId, currentWallet } = useWallet();
    const { apys } = useFarmApys();
    const { farmDetails } = useFarmDetails();
    const [sortedFarms, setSortedFarms] = useState<FarmDataExtended[]>();
    const [sortedBuy, setSortedBuy] = useState<FarmTableColumns>();
    const [decOrder, setDecOrder] = useState<boolean>(false);
    const [openedFarm, setOpenedFarm] = useState<number | undefined>();
    const [openDeprecatedFarm, setOpenDeprecatedFarm] = useState<boolean>(IS_LEGACY);

    useEffect(() => {
        if (sortedBuy) {
            handleSort(sortedBuy);
        }
    }, [sortedBuy, apys, decOrder]);

    useEffect(() => {
        setSortedBuy(undefined);
    }, [networkId]);

    const dynamicSort = (column: FarmTableColumns, decOrder: boolean) => (a: FarmDataExtended, b: FarmDataExtended) =>
        (decOrder ? 1 : -1) *
        (column === FarmTableColumns.Deposited
            ? Number(a.withdrawableAmounts![0].amountDollar) < Number(b.withdrawableAmounts![0].amountDollar)
                ? -1
                : Number(a.withdrawableAmounts![0].amountDollar) > Number(b.withdrawableAmounts![0].amountDollar)
                ? 1
                : 0
            : column === FarmTableColumns.APY
            ? a.apy < b.apy
                ? -1
                : a.apy > b.apy
                ? 1
                : 0
            : 0);

    const handleSort = (column: FarmTableColumns) => {
        const data: FarmDataExtended[] = farms.map((ele) => {
            const queryData = Object.values(farmDetails).find((item: FarmData) => item?.id === ele.id);
            return {
                ...ele,
                ...queryData,
                apy: apys[ele.id].apy,
            };
        });
        setSortedFarms(data.sort(dynamicSort(column, decOrder)));
    };

    return (
        <div className={`farms ${lightMode && "farms--light"}`}>
            <div className={`farm_header ${lightMode && "farm_header--light"}`}>
                <p>Earn</p>
                {isDev && (
                    <DeprecatedToggle
                        openDeprecatedFarm={openDeprecatedFarm}
                        setOpenDeprecatedFarm={setOpenDeprecatedFarm}
                    />
                )}
            </div>
            {networkId === defaultChainId ? (
                <>
                    <div className={`farm_table_header ${lightMode && "farm_table_header_light"}`}>
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
                    </div>
                    <p className="type_heading">{FarmTableColumns.Token}</p>
                    {sortedFarms
                        ? sortedFarms
                              .filter((farm) => farm.token_type === "Token")
                              .filter((farm) => (openDeprecatedFarm ? farm.isDeprecated : !farm.isDeprecated))
                              .map((farm, index) => (
                                  <FarmRow
                                      key={index + "nowallet"}
                                      farm={farm}
                                      openedFarm={openedFarm}
                                      setOpenedFarm={setOpenedFarm}
                                  />
                              ))
                        : farms
                              .filter((farm) => farm.token_type === "Token")
                              .filter((farm) => (openDeprecatedFarm ? farm.isDeprecated : !farm.isDeprecated))
                              .map((farm, index) => (
                                  <FarmRow
                                      key={index + "nowallet"}
                                      farm={farm}
                                      openedFarm={openedFarm}
                                      setOpenedFarm={setOpenedFarm}
                                  />
                              ))}

                    <div className={`farm_table_header ${lightMode && "farm_table_header_light"}`}>
                        <p className="item_asset" style={{ marginLeft: 20 }}>
                            {FarmTableColumns.Dual_Token}
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
                    </div>
                    <p className="type_heading">{FarmTableColumns.Dual_Token}</p>
                    {sortedFarms
                        ? sortedFarms
                              .filter((farm) => farm.token_type === "LP Token")
                              .filter((farm) => (openDeprecatedFarm ? farm.isDeprecated : !farm.isDeprecated))
                              .map((farm, index) => (
                                  <FarmRow
                                      key={index + "nowallet"}
                                      farm={farm}
                                      openedFarm={openedFarm}
                                      setOpenedFarm={setOpenedFarm}
                                  />
                              ))
                        : farms
                              .filter((farm) => farm.token_type === "LP Token")
                              .filter((farm) => (openDeprecatedFarm ? farm.isDeprecated : !farm.isDeprecated))
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
                                    Can't find your vault? It might have been deprecated. You can withdraw from old
                                    vaults here&nbsp;
                                    <a href="https://legacy.contrax.finance">Click Here</a>
                                </small>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <EmptyComponent>Please change network to Arbitrum to access the vaults</EmptyComponent>
            )}
        </div>
    );
}

export default Farms;
