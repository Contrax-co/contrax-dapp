import { useState, useEffect } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import './CompoundItem.css';
import Deposit from '../deposit/Deposit';
import PoolButton from '../PoolButton';
import Withdraw from '../withdraw/Withdraw';
import {
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

  useEffect(() => {
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
    getTotalVaultBalance(pool, setTotalVaultBalance);
  }, [pool, currentWallet]);

  useEffect(() => {
    priceToken(pool.lp_address, setPriceOfSingleToken);
  }, [pool, totalVaultBalance, userVaultBal]);

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
              <img
                alt={pool.alt1}
                className={`logofirst ${lightMode && 'logofirst--light'}`}
                src={pool.logo1}
              />
              <img
                alt={pool.alt2}
                className={`logo ${lightMode && 'logo--light'}`}
                src={pool.logo2}
              />
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
                    alt={pool.rewards_alt}
                    className="rewards_image"
                    src={pool.rewards}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pool_info">
            <div
              className={`container__apy ${
                lightMode && 'container__apy--light'
              }`}
            >
               {!totalVaultBalance ? (
                <p className={`pool_name__apy ${lightMode && 'pool_name__apy--light'}`}>
                  0
                </p>
              ): (
                <p className={`pool_name__apy ${lightMode && 'pool_name__apy--light'}`}>
                  {((userVaultBal/totalVaultBalance)*100).toFixed(2)} %
                </p>
              )}
             
            </div>

            <div className={`container ${lightMode && 'container--light'}`}>
              <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                {(totalVaultBalance * priceOfSingleToken).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </p>

              <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}>
                {totalVaultBalance.toFixed(2)}
              </p>
            </div>

            {/* How much the user has deposited */}

            <div className={`container ${lightMode && 'container--light'}`}>
              <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                {(userVaultBal * priceOfSingleToken).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </p>
              <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}>
                {userVaultBal.toFixed(5)}
              </p>
            </div>

            <div className={`container1 ${lightMode && 'container1--light'}`}>
              <img className={`container_rewards`} src={pool.rewards} alt={pool.rewards_alt} />
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
              alt1={pool.alt1}
              alt2={pool.alt2}
              logo1={pool.logo1}
              logo2={pool.logo2}
              pair1={pool.pair1}
              pair2={pool.pair2}
              token1={pool.token1}
              token_abi={pool.lp_abi}
              tokenAddress={pool.lp_address}
              token2={pool.token2}
              vaultAddress={pool.vault_addr}
              vault_abi={pool.vault_abi}
              onClick={() => setDetails(false)}
            />
          )}
          

        </div>
      )}
    </div>
  );
}

export default CompoundItem;
