import { useState, useEffect } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import './CompoundItem.css';
import Deposit from '../deposit/Deposit';
import PoolButton from '../PoolButton';
import Withdraw from '../withdraw/Withdraw';
import {
  getTotalVaultBalance,
  getUserVaultBalance,
  priceOfTokens,
  totalLPTokenExisting,
  usdTokenValueInVault,
  usdUserVaultValue,
} from './compound-functions';
import { useQuery } from '@apollo/client';
import { GET_DEPOSITED } from './queries';

function CompoundItem({ lightMode, pool, currentWallet, connectWallet }: any) {
  const [dropdown, setDropDown] = useState(false);
  const [buttonType, setButtonType] = useState('Deposit');

  const [userVaultBal, setUserVaultBalance] = useState(0);
  const [totalVaultBalance, setTotalVaultBalance] = useState(0);

  const [price0, setPrice0] = useState(0);
  const [price1, setPrice1] = useState(0);

  const [priceOfToken, setPriceOfToken] = useState(0);
  const [valueInVault, setValueInVault] = useState(0);

  const [userUsdVault, setUserUsdVault] = useState(0);

  const { data, loading, error } = useQuery(GET_DEPOSITED, {
    variables: {
      currentWallet,
    },
  });

  useEffect(() => {
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
    getTotalVaultBalance(pool, setTotalVaultBalance);
  }, [pool, currentWallet]);

  useEffect(() => {
    priceOfTokens(pool.token1, setPrice0);
    priceOfTokens(pool.token2, setPrice1);

    totalLPTokenExisting(pool, price0, price1, setPriceOfToken);
    usdTokenValueInVault(priceOfToken, totalVaultBalance, setValueInVault);
    usdUserVaultValue(priceOfToken, userVaultBal, setUserUsdVault);

    console.log(`the data being loaded from the hasura database is ${data}`);
  }, [
    pool,
    price0,
    price1,
    priceOfToken,
    totalVaultBalance,
    userVaultBal,
    data,
  ]);

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
              <p
                className={`pool_name__apy ${
                  lightMode && 'pool_name__apy--light'
                }`}
              >
                apy
              </p>
            </div>

            <div className={`container ${lightMode && 'container--light'}`}>
              <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                {valueInVault.toLocaleString('en-US', {
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
                {userUsdVault.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </p>
              <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}>
                {userVaultBal.toFixed(5)}
              </p>
            </div>

            <div className={`container ${lightMode && 'container--light'}`}>
              <p className={`pool_name ${lightMode && 'pool_name--light'}`}>
                $earned
              </p>
              <p className={`tvlLP ${lightMode && 'tvlLP--light'}`}> - </p>
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
        </div>
      )}
    </div>
  );
}

export default CompoundItem;
