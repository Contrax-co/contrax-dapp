import React from 'react';
import './Compound.css';
import { useQuery } from "react-query";
import CompoundItem from './CompoundItem';

function Compound({lightMode, currentWallet, connectWallet}) {

    const fetchPools = async () => {
        const res = await fetch("http://localhost:3001/api/pools.json");
        return res.json();
    };

    const {data, status} = useQuery("pools", fetchPools);
  

  return (
    <div className={`farms ${lightMode && "farms--light"}`}>
        <div className={`farm_header ${lightMode && "farm_header--light"}`}>
            <p>Farms</p> 
        </div>

        <div className={`farm__title ${lightMode && "farm__title--light"}`}>
            <p className={`farm__asset`}>ASSET</p>
            <div className={`farm__second__title`}>
                <p>APY</p>
                <p>LIQUIDITY</p>
                <p>DEPOSITED</p>
                <p>EARNED</p>
            </div>
        </div>

        {status === "success" && (
            <div className="pools_list">
                {data.map((pool) => (
                    <CompoundItem
                        key={pool.id}
                        lightMode={lightMode}
                        pool={pool}
                        currentWallet={currentWallet}
                        connectWallet={connectWallet}
                    />
                ))}
            </div>
        )}
       
    </div>
  )
}

export default Compound