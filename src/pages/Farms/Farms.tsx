import "./Farms.css";
import CompoundItem from "src/components/CompoundItem/CompoundItem";
import useApp from "src/hooks/useApp";
import useFarms from "src/hooks/farms/useFarms";

function Farms() {
    const { lightMode } = useApp();
    const { farms } = useFarms();

    return (
        <div className={`farms ${lightMode && "farms--light"}`}>
            <div className={`farm_header ${lightMode && "farm_header--light"}`}>
                <p>Farms</p>
            </div>

            <div className={`farm__title ${lightMode && "farm__title--light"}`}>
                <p className={`farm__asset`}>ASSET</p>
                <div className={`farm__second__title`}>
                    <p>DEPOSITED</p>
                    <p>SHARE</p>
                    <p>TOTAL LIQUIDITY</p>
                    <p>APY</p>
                </div>
            </div>

            <div className="pools_list">
                {farms.map((farm) => (
                    <CompoundItem key={farm.id} farm={farm} />
                ))}
            </div>
        </div>
    );
}

export default Farms;
