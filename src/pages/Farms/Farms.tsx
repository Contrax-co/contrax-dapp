import { useEffect, useState } from "react";
import "./Farms.css";
import useApp from "src/hooks/useApp";
import useFarms from "src/hooks/farms/useFarms";
import FarmRow from "src/components/FarmItem/FarmRow";
import { Farm, FarmData } from "src/types";
import { FarmTableColumns } from "src/types/enums";
import PoolButton from "src/components/PoolButton/PoolButton";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { useFarmApys } from "src/hooks/farms/useFarmApy";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import { Tabs } from "src/components/Tabs/Tabs";
import DotMenu from "./components/DotMenu";
interface FarmDataExtended extends Partial<FarmData>, Farm {
    apy: number;
}
function Farms() {
    const { lightMode } = useApp();
    const { farms } = useFarms();
    const [tab, setTab] = useState(1);
    const { networkId } = useWallet();
    const { apys } = useFarmApys();
    const { farmDetails } = useFarmDetails();

    const [sortedFarms, setSortedFarms] = useState<FarmDataExtended[]>();
    const [sortedBuy, setSortedBuy] = useState<FarmTableColumns>();
    const [decOrder, setDecOrder] = useState<boolean>(false);
    const [openedFarm, setOpenedFarm] = useState<number | undefined>();
    const [openDeprecatedFarm, setOpenDeprecatedFarm] = useState<boolean>(false);

    useEffect(() => {
        if (sortedBuy) {
            handleSort(sortedBuy);
        }
    }, [tab, sortedBuy, apys, decOrder]);

    useEffect(() => {
        setSortedBuy(undefined);
    }, [networkId]);

    const dynamicSort = (column: FarmTableColumns, decOrder: boolean) => (a: FarmDataExtended, b: FarmDataExtended) =>
        (decOrder ? 1 : -1) *
        (column === FarmTableColumns.Deposited
            ? Number(a.Withdrawable_Amounts![0].amountDollar) < Number(b.Withdrawable_Amounts![0].amountDollar)
                ? -1
                : Number(a.Withdrawable_Amounts![0].amountDollar) > Number(b.Withdrawable_Amounts![0].amountDollar)
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
            const queryData = Object.values(farmDetails).find((item) => item?.ID === ele.id);
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
                <p>Farms</p>
            </div>
            <div style={{ position: "relative", paddingRight: 50 }}>
                <Tabs style={{ padding: 0, marginBottom: 30 }}>
                    <PoolButton
                        variant={2}
                        onClick={() => {
                            setTab(1);
                            setSortedBuy(undefined);
                        }}
                        description="Single Tokens"
                        active={tab === 1}
                    />
                    <PoolButton
                        variant={2}
                        onClick={() => {
                            setTab(2);
                            setSortedBuy(undefined);
                        }}
                        description="Dual Tokens"
                        active={tab === 2}
                    />
                </Tabs>
                <DotMenu openDeprecatedFarm={openDeprecatedFarm} setOpenDeprecatedFarm={setOpenDeprecatedFarm} />
            </div>
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
                        setSortedBuy(FarmTableColumns.Deposited);
                        setDecOrder((prev) => !prev);
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
            {networkId === defaultChainId ? (
                sortedFarms ? (
                    sortedFarms
                        .filter((farm) => (tab === 1 ? farm.token_type === "Token" : farm.token_type === "LP Token"))
                        .filter((farm) => (openDeprecatedFarm ? farm.isDeprecated : !farm.isDeprecated))
                        .map((farm, index) => (
                            <FarmRow
                                key={index + "nowallet"}
                                farm={farm}
                                openedFarm={openedFarm}
                                setOpenedFarm={setOpenedFarm}
                            />
                        ))
                ) : (
                    farms
                        .filter((farm) => (tab === 1 ? farm.token_type === "Token" : farm.token_type === "LP Token"))
                        .filter((farm) => (openDeprecatedFarm ? farm.isDeprecated : !farm.isDeprecated))
                        .map((farm, index) => (
                            <FarmRow
                                key={index + "nowallet"}
                                farm={farm}
                                openedFarm={openedFarm}
                                setOpenedFarm={setOpenedFarm}
                            />
                        ))
                )
            ) : (
                <EmptyComponent>Please change network to Arbitrum to use the farms</EmptyComponent>
            )}
        </div>
    );
}

export default Farms;
