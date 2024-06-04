import React from "react";
import "./FarmInfo.css";
import useApp from "src/hooks/useApp";
import FarmDetails from "./FarmDetails/FarmDetails";
import useWallet from "src/hooks/useWallet";
import { NotSignedIn } from "src/components/NotSignedIn/NotSignedIn";

const FarmInfo: React.FC = () => {
    const { lightMode } = useApp();
    const { currentWallet } = useWallet();
    return (
        <div className={`farmslip ${lightMode && "farmslip--light"}`}>
            <div className={`farmslip_header ${lightMode && "farmslip_header--light"}`}>
                <p>Farm Info</p>
            </div>
            {currentWallet ? <FarmDetails /> : <NotSignedIn />}
        </div>
    );
};

export default FarmInfo;
