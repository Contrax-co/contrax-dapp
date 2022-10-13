import React, {useState} from 'react';
import Toggle from '../Toggle';
import './Withdraw.css';

function Withdraw({lightMode, pool}) {
  const [toggleType, setToggleType] = useState(false);

  return (
    <div className="whole_tab">
      <Toggle
        lightMode={lightMode}
        active={toggleType}
        pool={pool}
        onClick={() => setToggleType(!toggleType)}      
      />

      <div className="detail_container">

          <div className={`withdrawal_description ${lightMode && "withdrawal_description--light"}`}>
              <p className={`withdrawal_title ${lightMode && "withdrawal_title--light"}`}>Removal of Liquidity</p>
              {toggleType ? (
                  <p className="withdrawal_description2">Your deposited LP token can be withdrawn from the autocompounding vault back to the user's connected wallet. </p>
              ): (
                  <p className="withdrawal_description2">Your deposited LP token can be withdrawn from the autocompounding vault back into wallet as 
              native ETH tokens. </p>
              )}
          </div>

      </div>

    </div>
  )
}

export default Withdraw