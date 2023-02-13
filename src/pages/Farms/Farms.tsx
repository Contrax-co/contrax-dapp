import "./Farms.css";
import useApp from "src/hooks/useApp";
import { useFarmDetails } from "src/hooks/farms/useFarms";
import FarmRow from "src/components/FarmItem/FarmRow";
import { FarmDetails } from "src/types";
import { FarmTableColumns } from "src/types/enums";
import { useEffect, useState } from "react";
import PoolButton from "src/components/PoolButton/PoolButton";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";

function Farms() {
    const { lightMode } = useApp();
    const [tab, setTab] = useState(1);
    const { networkId } = useWallet();
    const { normalFarms, advancedFarms } = useFarmDetails();
    const [sortedFarms, setSortedFarms] = useState<FarmDetails[]>();
    const [sortedBuy, setSortedBuy] = useState<FarmTableColumns>();
    const [decOrder, setDecOrder] = useState<boolean>(false);

    useEffect(() => {
        setSortedFarms(tab === 1 ? normalFarms : advancedFarms);
    }, [tab, normalFarms, advancedFarms]);

    useEffect(() => {
        setSortedBuy(undefined);
    }, [networkId]);

    useEffect(() => console.log("farms rerendered"));

    const dynamicSort = (column: FarmTableColumns, decOrder: boolean) => (a: FarmDetails, b: FarmDetails) =>
        (decOrder ? 1 : -1) *
        (column === FarmTableColumns.Deposited
            ? a.userVaultBalance * a.priceOfSingleToken < b.userVaultBalance * b.priceOfSingleToken
                ? -1
                : a.userVaultBalance * a.priceOfSingleToken > b.userVaultBalance * b.priceOfSingleToken
                ? 1
                : 0
            : column === FarmTableColumns.APY
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
                    description="Normal"
                    active={tab === 1}
                />
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(2);
                        setSortedBuy(undefined);
                    }}
                    description="Advanced"
                    active={tab === 2}
                />
            </div>
            <div className={`farm_table_header ${lightMode && "farm_table_header_light"}`}>
                <p className="item_asset" style={{ marginLeft: 20 }}>
                    {FarmTableColumns.Token}
                </p>
                <p onClick={() => handleSort(FarmTableColumns.Deposited)}>
                    <span>{FarmTableColumns.Deposited}</span>
                    {sortedBuy === FarmTableColumns.Deposited ? (
                        decOrder ? (
                            <RiArrowDownSLine fontSize={21} />
                        ) : (
                            <RiArrowUpSLine fontSize={21} />
                        )
                    ) : null}
                </p>
                <p onClick={() => handleSort(FarmTableColumns.APY)}>
                    <span>{FarmTableColumns.APY}</span>
                    {sortedBuy === FarmTableColumns.APY ? (
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
                sortedFarms?.map((farm) => <FarmRow key={farm.id} farm={farm} />)
            ) : (
                <div className={`change_network_section ${lightMode && "change_network_section_light"}`}>
                    <p>Please change network to Arbitrum to use the farms</p>
                </div>
            )}
        </div>
    );
}

export default Farms;
