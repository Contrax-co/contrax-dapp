import React from "react";
import "./FarmInfo.css";
import useApp from "src/hooks/useApp";
import { FarmTVL } from "./FarmTVL/FarmTVL";

const FarmInfo: React.FC = () => {
    const { lightMode } = useApp();
    return (
        <div className={`farmslip ${lightMode && "farmslip--light"}`}>
            <div className={`farmslip_header ${lightMode && "farmslip_header--light"}`}>
                <p>Farm Info</p>
            </div>
            <div className={`farmslip_table_header ${lightMode && "farmslip_table_header_light"}`}>
                <h1 className="item_asset" style={{ marginLeft: 20 }}>
                    TVL of Farms:
                </h1>
            </div>
            <FarmTVL />
        </div>
    );
};

export default FarmInfo;
