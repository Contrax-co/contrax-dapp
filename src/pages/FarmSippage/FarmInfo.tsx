import React from "react";
import "./FarmInfo.css";
import useApp from "src/hooks/useApp";
import { FarmTVL } from "./FarmTVL/FarmTVL";
import SlippageFarm from "./SlippageFarm/SlippageFarm";

const FarmInfo: React.FC = () => {
    const { lightMode } = useApp();
    return (
        <div className={`farmslip ${lightMode && "farmslip--light"}`}>
            <div className={`farmslip_header ${lightMode && "farmslip_header--light"}`}>
                <p>Farm Info</p>
            </div>
            <SlippageFarm />
        </div>
    );
};

export default FarmInfo;
