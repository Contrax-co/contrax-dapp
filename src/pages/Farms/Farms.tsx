import "./Farms.css";
import useApp from "src/hooks/useApp";
import useFarms from "src/hooks/farms/useFarms";
import FarmRow from "src/components/FarmItem/FarmRow";
import { FarmData, FarmDetails } from "src/types";
import { FarmTableColumns } from "src/types/enums";
import { useEffect, useMemo, useState } from "react";
import PoolButton from "src/components/PoolButton/PoolButton";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { useQueries, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { FARM_DATA } from "src/config/constants/query";
import useConstants from "src/hooks/useConstants";
import farmFunctions from "src/api/pools";
import { v4 as uuid } from "uuid";
import { useFarmApys } from "src/hooks/farms/useFarmApy";

function Farms() {
    const { lightMode } = useApp();
    const { farms } = useFarms();
    const [tab, setTab] = useState(1);
    const { networkId, currentWallet, provider, balanceBigNumber, balance } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { apys } = useFarmApys();
    const queries = useQueries({
        queries: farms
            .filter((ele) => ele.token_type === "Token")
            .map((item) => ({
                queryKey: FARM_DATA(currentWallet, NETWORK_NAME, item.id, balance),
                queryFn: () => farmFunctions[item.id]?.getFarmData(provider, currentWallet, balanceBigNumber),
                enabled: !!currentWallet && !!provider && !!item && !!balance,
            })),
    });

    const normalFarmIds = useMemo(
        () => farms.filter((item) => item.token_type === "Token").map((item) => item.id),
        [farms]
    );
    const advancedFarmIds = useMemo(
        () => farms.filter((item) => item.token_type === "LP Token").map((item) => item.id),
        [farms]
    );

    const normalFarms = useMemo(
        () => queries.filter((item) => normalFarmIds.some((ele) => ele === item?.data?.ID)),
        [JSON.stringify(queries.map((item) => item.isFetching)), normalFarmIds]
    );
    const advancedFarms = useMemo(
        () => queries.filter((item) => advancedFarmIds.some((ele) => ele === item?.data?.ID)),
        [JSON.stringify(queries.map((item) => item.isFetching)), advancedFarmIds]
    );

    const [sortedFarms, setSortedFarms] = useState<UseQueryResult<FarmData, unknown>[]>();
    const [sortedBuy, setSortedBuy] = useState<FarmTableColumns>();
    const [decOrder, setDecOrder] = useState<boolean>(false);
    const [openedFarm, setOpenedFarm] = useState<number | undefined>();
    console.log(normalFarmIds, normalFarms, sortedFarms);

    useEffect(() => {
        if (sortedBuy) {
            handleSort(sortedBuy);
        } else {
            setSortedFarms(tab === 1 ? normalFarms : advancedFarms);
        }
    }, [tab, sortedBuy, apys, normalFarms, advancedFarms]);

    useEffect(() => {
        setSortedBuy(undefined);
    }, [networkId]);

    const dynamicSort =
        (column: FarmTableColumns, decOrder: boolean) =>
        (a: UseQueryResult<FarmData, unknown>, b: UseQueryResult<FarmData, unknown>) =>
            (decOrder ? 1 : -1) *
            (column === FarmTableColumns.Deposited
                ? Number(a.data?.Max_Token_Withdraw_Balance_Dollar) < Number(b.data?.Max_Token_Withdraw_Balance_Dollar)
                    ? -1
                    : Number(a.data?.Max_Token_Withdraw_Balance_Dollar) >
                      Number(b.data?.Max_Token_Withdraw_Balance_Dollar)
                    ? 1
                    : 0
                : column === FarmTableColumns.APY
                ? a.data?.ID && b.data?.ID && apys[a.data.ID] < apys[b.data.ID]
                    ? -1
                    : a.data?.ID && b.data?.ID && apys[a.data.ID] > apys[b.data.ID]
                    ? 1
                    : 0
                : farms.find((ele) => ele.id === a.data?.ID)!.name < farms.find((ele) => ele.id === b.data?.ID)!.name
                ? -1
                : farms.find((ele) => ele.id === a.data?.ID)!.name > farms.find((ele) => ele.id === b.data?.ID)!.name
                ? 1
                : 0);

    const handleSort = (column: FarmTableColumns) => {
        if (sortedBuy === undefined) {
            setSortedFarms((prev) => prev?.sort(dynamicSort(column, decOrder)));
            setSortedBuy(column);
            setDecOrder((prev) => !prev);
            return;
        }
        if (column === sortedBuy) {
            setSortedFarms((prev) => prev?.sort(dynamicSort(column, decOrder)));
            setDecOrder((prev) => !prev);
        } else {
            setSortedFarms((prev) => prev?.sort(dynamicSort(column, !decOrder)));
            setSortedBuy(column);
        }
    };

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
                <p onClick={() => setSortedBuy(FarmTableColumns.APY)}>
                    <span>{FarmTableColumns.APY}</span>
                    {sortedBuy === FarmTableColumns.APY ? (
                        decOrder ? (
                            <RiArrowDownSLine fontSize={21} />
                        ) : (
                            <RiArrowUpSLine fontSize={21} />
                        )
                    ) : null}
                </p>
                <p onClick={() => setSortedBuy(FarmTableColumns.Deposited)} className={`header_deposite`}>
                    <span>{FarmTableColumns.Deposited}</span>
                    {sortedBuy === FarmTableColumns.Deposited ? (
                        decOrder ? (
                            <RiArrowDownSLine fontSize={21} />
                        ) : (
                            <RiArrowUpSLine fontSize={21} />
                        )
                    ) : null}
                </p>
                <p onClick={() => setSortedBuy(FarmTableColumns.EARNED)} className={`header_earned`}>
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
                sortedFarms?.length! > 0 ? (
                    sortedFarms!.map((farm, index) => (
                        <FarmRow
                            key={uuid()}
                            farmData={farm.data}
                            farm={farms.find((ele) => ele.id === farm.data?.ID)!}
                            openedFarm={openedFarm}
                            setOpenedFarm={setOpenedFarm}
                            isFarmLoading={farm.isLoading}
                        />
                    ))
                ) : (
                    farms
                        .filter((farm) => (tab === 1 ? farm.token_type === "Token" : farm.token_type === "LP Token"))
                        .map((farm, index) => (
                            <FarmRow
                                key={uuid()}
                                farmData={undefined}
                                farm={farm}
                                openedFarm={openedFarm}
                                setOpenedFarm={setOpenedFarm}
                                isFarmLoading={false}
                                hideData={true}
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
