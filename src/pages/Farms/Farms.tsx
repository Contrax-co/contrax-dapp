import "./Farms.css";
import useApp from "src/hooks/useApp";
import useFarms from "src/hooks/farms/useFarms";
import FarmRow from "src/components/FarmItem/FarmRow";
import { Farm, FarmData } from "src/types";
import { FarmTableColumns } from "src/types/enums";
import { useEffect, useMemo, useState } from "react";
import PoolButton from "src/components/PoolButton/PoolButton";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { FARM_DATA } from "src/config/constants/query";
import useConstants from "src/hooks/useConstants";
import farmFunctions from "src/api/pools";
import { v4 as uuid } from "uuid";
import { useFarmApys } from "src/hooks/farms/useFarmApy";
interface FarmDataExtended extends Partial<FarmData>, Farm {
    apy: number;
}
function Farms() {
    const { lightMode } = useApp();
    const { farms } = useFarms();
    const [tab, setTab] = useState(1);
    const { networkId, currentWallet, provider, balanceBigNumber, balance } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { allFarmApys } = useFarmApys();
    // const queriesData = useMemo(
    //     () =>
    //         farms
    //             .filter((f) => (tab === 1 ? f.token_type === "Token" : f.token_type === "LP Token"))
    //             .map((item) => ({
    //                 queryKey: FARM_DATA(currentWallet, NETWORK_NAME, item.id, balance),
    //                 queryFn: () => farmFunctions[item.id]?.getFarmData(provider, currentWallet, balanceBigNumber),
    //                 enabled: !!currentWallet && !!provider && !!item && !!balance,
    //             })),
    //     [farms, tab]
    // );
    const queries = useQueries({
        queries: farms
            .filter((f) => (tab === 1 ? f.token_type === "Token" : f.token_type === "LP Token"))
            .map((item) => ({
                queryKey: FARM_DATA(currentWallet, NETWORK_NAME, item.id, balance),
            })),
    });

    const [sortedFarms, setSortedFarms] = useState<FarmDataExtended[]>();
    const [sortedBuy, setSortedBuy] = useState<FarmTableColumns>();
    const [decOrder, setDecOrder] = useState<boolean>(false);
    const [openedFarm, setOpenedFarm] = useState<number | undefined>();

    useEffect(() => {
        if (sortedBuy) {
            handleSort(sortedBuy);
        }
    }, [tab, sortedBuy, allFarmApys, decOrder]);

    useEffect(() => {
        setSortedBuy(undefined);
    }, [networkId]);

    const dynamicSort = (column: FarmTableColumns, decOrder: boolean) => (a: FarmDataExtended, b: FarmDataExtended) =>
        (decOrder ? 1 : -1) *
        (column === FarmTableColumns.Deposited
            ? Number(a.Max_Token_Withdraw_Balance_Dollar) < Number(b.Max_Token_Withdraw_Balance_Dollar)
                ? -1
                : Number(a.Max_Token_Withdraw_Balance_Dollar) > Number(b.Max_Token_Withdraw_Balance_Dollar)
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
            // @ts-ignore
            const queryData = queries.find((item) => item.data?.ID === ele.id)?.data as FarmData | undefined;
            return {
                ...ele,
                ...queryData,
                apy: allFarmApys[ele.id].apy,
            };
        });

        setSortedFarms(data.sort(dynamicSort(column, decOrder)));
    };

    console.log(sortedFarms);
    return (
        <div className={`farms ${lightMode && "farms--light"}`}>
            <div className={`farm_header ${lightMode && "farm_header--light"}`}>
                <p>Farms</p>
            </div>
            <div className="drop_buttons" style={{ padding: 0, marginBottom: 30 }}>
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
                <p
                    onClick={() => {
                        setSortedBuy(FarmTableColumns.EARNED);
                        setDecOrder((prev) => !prev);
                    }}
                    className={`header_earned`}
                >
                    <span>{FarmTableColumns.EARNED}</span>
                    {sortedBuy === FarmTableColumns.EARNED ? (
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
