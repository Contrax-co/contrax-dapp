import { useState, useEffect } from 'react';
import './Compound.css';
import CompoundItem from './compound-item/CompoundItem';

var isLocalhost = false;
if (window.location.hostname === 'localhost') {
  isLocalhost = true;
}

var fetchUrl = 'https://testing.contrax.finance/api/pools.json';
if (isLocalhost) {
  fetchUrl = 'http://localhost:3000/api/pools.json';
}

function Compound({ lightMode, currentWallet, connectWallet }: any) {
  const [pools, setPools] = useState([]);

  useEffect(() => {
    fetch(fetchUrl) //`http://localhost:3000/api/pools.json` or `https://testing.contrax.finance/api/pools.json` for when we want it done locally
      .then((response) => response.json())
      .then((data) => {
        setPools(data);
      });
  }, []);

  return (
    <div className={`farms ${lightMode && 'farms--light'}`}>
      <div className={`farm_header ${lightMode && 'farm_header--light'}`}>
        <p>Farms</p>
      </div>

      <div className={`farm__title ${lightMode && 'farm__title--light'}`}>
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

export default Compound;
