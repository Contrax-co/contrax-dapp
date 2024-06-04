import React from "react";
import "./FarmInfo.css";
import useApp from "src/hooks/useApp";
import FarmDetails from "./FarmDetails/FarmDetails";

const FarmInfo: React.FC = () => {
    const { lightMode } = useApp();
    return (
        <div className={`farmslip ${lightMode && "farmslip--light"}`}>
            <div className={`farmslip_header ${lightMode && "farmslip_header--light"}`}>
                <p>Farm Info</p>
            </div>
            <FarmDetails />
        </div>
    );
};

export default FarmInfo;
