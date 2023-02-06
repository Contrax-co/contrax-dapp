import "./Farms.css";
import useApp from "src/hooks/useApp";
import { useFarmDetails } from "src/hooks/farms/useFarms";
import FarmItem from "src/components/FarmItem/FarmItem";
import FarmRow from "src/components/FarmItem/FarmRow";
import { FarmDetails } from "src/types";
import { FarmTableColumns } from "src/types/enums";
import { useEffect, useState } from "react";
import PoolButton from "src/components/PoolButton/PoolButton";

function Farms() {
    const { lightMode } = useApp();
    const [tab, setTab] = useState(1);
    const { farmDetails: farms, normalFarms, advancedFarms } = useFarmDetails();
    const [sortedFarms, setSortedFarms] = useState<FarmDetails[]>();
    const [decOrder, setDecOrder] = useState<boolean>(false);

    useEffect(() => {
        setSortedFarms(tab === 1 ? normalFarms : advancedFarms);
    }, [farms, tab]);

    const dynamicSort = (column: FarmTableColumns, decOrder: boolean) => (a: FarmDetails, b: FarmDetails) =>
        (decOrder ? 1 : -1) *
        (column === FarmTableColumns.Deposited
            ? a.userVaultBal * a.priceOfSingleToken < b.userVaultBal * b.priceOfSingleToken
                ? -1
                : a.userVaultBal * a.priceOfSingleToken > b.userVaultBal * b.priceOfSingleToken
                ? 1
                : 0
            : column === FarmTableColumns.TotalLiquidity
            ? a.totalPlatformBalance * a.priceOfSingleToken < b.totalPlatformBalance * b.priceOfSingleToken
                ? -1
                : a.totalPlatformBalance * a.priceOfSingleToken > b.totalPlatformBalance * b.priceOfSingleToken
                ? 1
                : 0
            : column === FarmTableColumns.Apy
            ? a.apys.apy < b.apys.apy
                ? -1
                : a.apys.apy > b.apys.apy
                ? 1
                : 0
            : a.name < b.name
            ? -1
            : a.name > b.name
            ? 1
            : 0);

    const handleSort = (column: FarmTableColumns) => {
        console.log("handleSort");
        // let temp = [...sortedFarms!];
        setSortedFarms((prev) => prev?.sort(dynamicSort(column, decOrder)));
        setDecOrder((prev) => !prev);
    };

    return (
        <div className={`farms ${lightMode && "farms--light"}`}>
            <div className={`farm_header ${lightMode && "farm_header--light"}`}>
                <p>Farms</p>
            </div>
            <div className="drop_buttons" style={{ padding: 0, marginBottom: 30 }}>
                <PoolButton variant={2} onClick={() => setTab(1)} description="Normal" active={tab === 1} />
                <PoolButton variant={2} onClick={() => setTab(2)} description="Advanced" active={tab === 2} />
            </div>
            <table style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th className={`farm_th ${lightMode && "farm__title--light"}`}>ASSET</th>
                        <th className={`farm_th ${lightMode && "farm__title--light"}`}>DEPOSITED</th>
                        <th className={`farm_th ${lightMode && "farm__title--light"}`}>TOTAL LIQUIDITY</th>
                        <th className={`farm_th ${lightMode && "farm__title--light"}`}>APY</th>
                    </tr>
                </thead>
                <tbody className="pools_list">
                    {sortedFarms?.map((farm) => (
                        <FarmRow key={farm.id} farm={farm} />
                    ))}
                </tbody>
            </table>
            <div className={`farm__title ${lightMode && "farm__title--light"}`}>
                <p className={`farm__asset`}>ASSET</p>
                <div className={`farm__second__title`}>
                    <p className="farm__second__title__deposite" onClick={() => handleSort(FarmTableColumns.Deposited)}>
                        DEPOSITED
                    </p>
                    <p
                        className="farm__second__title__tvl__desktop"
                        onClick={() => handleSort(FarmTableColumns.TotalLiquidity)}
                    >
                        TOTAL LIQUIDITY
                    </p>
                    <p
                        className="farm__second__title__tvl__mobile"
                        onClick={() => handleSort(FarmTableColumns.TotalLiquidity)}
                    >
                        TVL
                    </p>
                    <p className="farm__second__title__apy" onClick={() => handleSort(FarmTableColumns.Apy)}>
                        APY
                    </p>
                </div>
            </div>
            <div className="pools_list">
                {sortedFarms?.map((farm) => (
                    <FarmItem key={farm.id} farm={farm} />
                ))}
            </div>
        </div>
    );
}

export default Farms;
