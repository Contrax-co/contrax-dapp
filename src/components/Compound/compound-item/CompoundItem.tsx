import React, {useState, useEffect} from 'react';
import {RiArrowDownSLine, RiArrowUpSLine} from 'react-icons/ri';
import './CompoundItem.css';
import Deposit from '../deposit/Deposit';
import PoolButton from '../PoolButton';
import Withdraw from '../withdraw/Withdraw';
import { getUserVaultBalance } from './compound-functions';

function CompoundItem({lightMode, pool, currentWallet, connectWallet}:any) {
  const [dropdown, setDropDown] = useState(false);
  const [buttonType, setButtonType] = useState("Deposit");

  const [userVaultBal, setUserVaultBalance] = useState(0);

  useEffect(() => {
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
  }, [pool, currentWallet])


  return (
    <div className={`pools ${lightMode && "pools--light"}`}>
      <div className="single_pool" key={pool.id} onClick={() =>  setDropDown(!dropdown)}>

        <div className="row_items">

            <div className="title_container">
                <div className="pair">
                    <img alt={pool.alt1} className={`logofirst ${lightMode && "logofirst--light"}`} src={pool.logo1}/>
                    <img alt={pool.alt2} className={`logo ${lightMode && "logo--light"}`} src={pool.logo2}/>
                </div>

                <div>
                    <div className="pool_title">
                        <p className={`pool_name ${lightMode && "pool_name--light"}`}>{pool.name}</p>
                        <div className="rewards_div">
                            <p className={`farm_type ${lightMode && "farm_type--light"}`}>{pool.platform}</p>
                            <img alt={pool.rewards_alt} className="rewards_image" src={pool.rewards}/>
                        </div>
                    </div>  

                </div>
            </div>


            <div className="pool_info">

                <div className={`container__apy ${lightMode && "container__apy--light"}`}>
                    <p className={`pool_name__apy ${lightMode && "pool_name__apy--light"}`}>apy</p>
                </div>

                <div className={`container ${lightMode && "container--light"}`}>
                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                        $total value
                    </p>
                    
                    <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>total number Tokens</p>
                    
                </div>

                {/* How much the user has deposited */}
            
                <div className={`container ${lightMode && "container--light"}`}>
                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                        $user value
                    </p>
                    <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>{userVaultBal.toFixed(5)}</p>
                </div>

                <div className={`container ${lightMode && "container--light"}`}>
                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                      $earned
                    </p>
                    <p className={`tvlLP ${lightMode && "tvlLP--light"}`}> - </p>
                </div>

            </div>

            <div className={`dropdown ${lightMode && "dropdown--light"}`}>
                {dropdown === false ? <RiArrowDownSLine /> :  <RiArrowUpSLine />}  
            </div>

        </div>

      </div>

      {dropdown === false ? null : (
        <div className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>

            <div className="drop_buttons">
                <PoolButton
                  lightMode={lightMode}
                  onClick={() => setButtonType("Deposit")} 
                  description="deposit"
                  active={buttonType === "Deposit"}
                />
                <PoolButton
                  lightMode={lightMode}
                  onClick={() => setButtonType("Withdraw")} 
                  description="withdraw"
                  active={buttonType === "Withdraw"}
                />
            </div>

            {buttonType === "Deposit" && (
              <Deposit
                lightMode={lightMode}
                pool={pool}
                currentWallet={currentWallet}
                connectWallet={connectWallet}
              />
            )}

            {buttonType === "Withdraw" && (
              <Withdraw
                lightMode={lightMode}
                pool={pool}
                currentWallet={currentWallet}
                connectWallet={connectWallet}
              />
            )}

        </div>
      )}
    </div>
  )
}

export default CompoundItem