import { useState, useEffect } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import './CompoundItem.css';
import Deposit from '../deposit/Deposit';
import PoolButton from '../PoolButton';
import Withdraw from '../withdraw/Withdraw';
import {CgInfo} from "react-icons/cg";
import {
  apyPool,
  calculateFarmAPY,
  calculateFeeAPY,
  findCompoundAPY,
  getTotalVaultBalance,
  getUserVaultBalance,
  priceToken
} from './compound-functions';
import Details from '../Details/Details';

function CompoundItem({ lightMode, pool, currentWallet, connectWallet }: any) {
  const [dropdown, setDropDown] = useState(false);
  const [buttonType, setButtonType] = useState('Deposit');

  const [userVaultBal, setUserVaultBalance] = useState(0);
  const [totalVaultBalance, setTotalVaultBalance] = useState(0);

  const [priceOfSingleToken, setPriceOfSingleToken] = useState(0);

  const [details, setDetails] = useState(false); 
  const [rewardAPY, setRewardApy] = useState(0);
  const [feeAPY, setFeeAPY] = useState(0);

  const [apyVisionCompound, setAPYVisionCompound] = useState(0); 
  const [compoundAPY, setCompoundAPY] = useState(0);

  useEffect(() => {
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
    getTotalVaultBalance(pool, setTotalVaultBalance);
  }, [pool, currentWallet]);

  useEffect(() => {
    priceToken(pool.lp_address, setPriceOfSingleToken);
    apyPool(pool.lp_address, setRewardApy); 
    calculateFeeAPY(pool.lp_address, setFeeAPY);
    calculateFarmAPY(rewardAPY, feeAPY, setAPYVisionCompound); 
    findCompoundAPY(pool.apy, setCompoundAPY);
  }, [pool, totalVaultBalance, userVaultBal, rewardAPY, feeAPY]);

  return (
    <div className={`pools ${lightMode && 'pools--light'}`}>
      <div
        className="single_pool"
        key={pool.id}
        onClick={() => setDropDown(!dropdown)}
      >
        <div className="row_items">
          <div className="title_container">
            <div className="pair">
              {pool.logo1 ? (
                <img
                alt={pool.alt1}
                className={`logofirst ${lightMode && 'logofirst--light'}`}
                src={pool.logo1}
                />
              ): null}
              
              {pool.logo2 ? (
                <img
                alt={pool.alt2}
                className={`logo ${lightMode && 'logo--light'}`}
                src={pool.logo2}
                />
              ) :null}
             
            </div>

            <div>
              <div className="pool_title">
                <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                  {pool.name}
                </p>
                <div className="rewards_div">
                  <p className={`farm_type ${lightMode && 'farm_type--light'}`}>
                    {pool.platform}
                  </p>
                  <img
                    alt={pool.platform_alt}
                    className="rewards_image"
                    src={pool.platform_logo}
                  />
                </div>
              </div>
            </div>
          </div>

           {/* How much the user has deposited */}

           {(userVaultBal * priceOfSingleToken) < 0.01 ? (
                <div className={`container ${lightMode && 'container--light'}`}>
                  <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                   
                  </p>
                  <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}>
                   
                  </p>

                </div>
              ): (

                <div className={`container ${lightMode && 'container--light'}`}>
                    <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                      {(userVaultBal * priceOfSingleToken).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </p>
                    <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}>
                      {userVaultBal.toFixed(10)}
                    </p>

                </div>
              )}

          <div className="pool_info">
            <div
              className={`container__apy ${
                lightMode && 'container__apy--light'
              }`}
            >
               {userVaultBal * priceOfSingleToken < 0.01 ? (
                <p className={`pool_name__apy ${lightMode && 'pool_name__apy--light'}`}>
                  
                </p>
              ): (
                <p className={`pool_name__apy ${lightMode && 'pool_name__apy--light'}`}>
                  {((userVaultBal/totalVaultBalance)*100).toFixed(2)} %
                </p>
              )}
             
            </div>

            {totalVaultBalance * priceOfSingleToken < 0.01 ? (
              <div className={`container ${lightMode && 'container--light'}`}>
                <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                  {(0).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>

                <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}>
                  0
                </p>
              </div>
            ) : (

              <div className={`container ${lightMode && 'container--light'}`}>
                <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                  {(totalVaultBalance * priceOfSingleToken).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>

                <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}>
                  {totalVaultBalance.toFixed(10)}
                </p>
              </div>
            )}
          
            <div className={`container1 ${lightMode && 'container1--light'}`}>
              {!pool.apy ? (
                <div className={`container1_apy ${lightMode && 'container1_apy--light'}`}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                      {(apyVisionCompound + rewardAPY + feeAPY).toFixed(2)}%
                    </p>
                
                    <CgInfo className={`apy_info ${lightMode && 'apy_info--light'}`}/>
                    <div className={`apy_hidden ${lightMode && 'apy_hidden--light'}`}>
                      <p>reward apy: {rewardAPY.toFixed(2)}%</p>
                      <p>fee apy: {feeAPY.toFixed(2)}%</p>
                      <p>compound apy: {apyVisionCompound.toFixed(2)}%</p>
                    </div>
              
                  </div>
                
                </div>
              ) : (
                <div className={`container1_apy ${lightMode && 'container1_apy--light'}`}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                      {(compoundAPY+ Number(pool.apy)).toFixed(2)}%
                    </p>
                    <CgInfo className={`apy_info ${lightMode && 'apy_info--light'}`}/>
                    <div className={`apy_hidden ${lightMode && 'apy_hidden--light'}`}>
                      <p>rewards apy: {Number(pool.apy).toFixed(2)}%</p>
                      <p>compound apy: {compoundAPY.toFixed(2)}%</p>
                    </div>
                  </div>
                 
                </div>
              )}
            </div>
          </div>

          <div className={`dropdown ${lightMode && 'dropdown--light'}`}>
            {dropdown === false ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
          </div>
        </div>
      </div>

      {dropdown === false ? null : (
        <div className={`dropdown_menu ${lightMode && 'dropdown_menu--light'}`}>
          <div className="drop_buttons">
            <PoolButton
              lightMode={lightMode}
              onClick={() => setButtonType('Deposit')}
              description="deposit"
              active={buttonType === 'Deposit'}
            />
            <PoolButton
              lightMode={lightMode}
              onClick={() => setButtonType('Withdraw')}
              description="withdraw"
              active={buttonType === 'Withdraw'}
            />
          </div>

          {buttonType === 'Deposit' && (
            <Deposit
              lightMode={lightMode}
              pool={pool}
              currentWallet={currentWallet}
              connectWallet={connectWallet}
            />
          )}

          {buttonType === 'Withdraw' && (
            <Withdraw
              lightMode={lightMode}
              pool={pool}
              currentWallet={currentWallet}
              connectWallet={connectWallet}
            />
          )}

          {details === false ? (
            <div className={`see_details_dropdown ${lightMode && 'see_details_dropdown--light'}`} onClick={() => setDetails(true)}>
              <p className={`see_details_description ${lightMode && 'see_details_description--light'}`}>See more details</p>        
              <RiArrowDownSLine />
            </div>
          ): (
            <Details 
              lightMode={lightMode}
              currentWallet={currentWallet}
              pool={pool}
              onClick={() => setDetails(false)}
            />
          )}
          

        </div>
      )}
    </div>
  );
}

export default CompoundItem;
