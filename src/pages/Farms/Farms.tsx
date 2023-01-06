import { useState, useEffect } from "react";
import "./Farms.css";
import CompoundItem from "src/components/CompoundItem/CompoundItem";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import usePools from "src/hooks/usePools";

function Farms() {
    const { lightMode } = useApp();
    const { currentWallet, connectWallet } = useWallet();
    const { pools } = usePools();

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
                {pools.map((pool: any) => (
                    <CompoundItem
                        key={pool.id}
                        lightMode={lightMode}
                        pool={pool}
                        currentWallet={currentWallet}
                        connectWallet={connectWallet}
                    />
                ))}
            </div>
        </div>
    );
}

export default Farms;
