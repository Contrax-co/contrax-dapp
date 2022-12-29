import { useState, useEffect } from 'react';
import './Deposit.css';
import { MoonLoader } from 'react-spinners';
import {
  deposit,
  depositAll,
  getEthBalance,
  getLPBalance,
  priceToken,
  zapIn,
  zapInAll
} from './deposit-functions';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { MdOutlineErrorOutline } from 'react-icons/md';
import Toggle from '../Toggle';

function Deposit({ lightMode, pool, currentWallet, connectWallet }: any) {
  const [toggleType, setToggleType] = useState(true);

  const [ethUserBal, setEthUserBal] = useState(0);
  const [lpUserBal, setLPUserBal] = useState(0);

  const [isLoading, setLoading] = useState(false);

  const [lpDepositAmount, setLPDepositAmount] = useState(0.0);
  const [ethDepositAmount, setEthDepositAmount] = useState(0.0);

  const [loaderMessage, setLoaderMessage] = useState('');
  const [success, setSuccess] = useState('loading');
  const [secondaryMessage, setSecondaryMessage] = useState('');
  const [link, setLink] = useState(false);
  const [hash, setHash] = useState(''); 

  const [price, setPrice] = useState(0);

  const refresh = () => window.location.reload();

  useEffect(() => {
    getEthBalance(currentWallet, setEthUserBal);
    getLPBalance(pool, currentWallet, setLPUserBal);
  }, [currentWallet, ethUserBal, pool, lpUserBal]);

  useEffect(() => {
    priceToken(pool.lp_address, setPrice);
  }, [pool]);

  const handleDepositChange = (e: any) => {
    setLPDepositAmount(e.target.value);
  };

  const handleEthDepositChange = (e: any) => {
    setEthDepositAmount(e.target.value);
  };

  function depositAmount() {
    if (lpDepositAmount === lpUserBal) {
      depositAll(
        setLPUserBal,
        currentWallet,
        pool,
        lpDepositAmount,
        setLPDepositAmount,
        setLoading,
        setLoaderMessage,
        setSuccess,
        setSecondaryMessage,
        setLink,
        setHash
      );
    } else {
      deposit(
        setLPUserBal,
        currentWallet,
        pool,
        lpDepositAmount,
        setLPDepositAmount,
        setLoading,
        setLoaderMessage,
        setSuccess,
        setSecondaryMessage,
        setLink,
        setHash
      );
    }
  }

  function zapDeposit() {
    if(ethDepositAmount === ethUserBal){
      zapInAll(
        setEthUserBal, 
        currentWallet, 
        setLoading, 
        pool, 
        ethDepositAmount, 
        setEthDepositAmount, 
        setLoaderMessage, 
        setSuccess, 
        setSecondaryMessage, 
        setLink, 
        setHash
      );
    }else {
      zapIn(
        setEthUserBal, 
        currentWallet, 
        setLoading, 
        pool, 
        ethDepositAmount, 
        setEthDepositAmount, 
        setLoaderMessage, 
        setSuccess, 
        setSecondaryMessage, 
        setLink, 
        setHash
      );

    }
  }
  function maxDeposit() {
    setLPDepositAmount(lpUserBal);
  }

  function maxEthDeposit() {
    setEthDepositAmount(ethUserBal);
  }

  return (
    <div className="addliquidity_outsidetab">
      {pool.token_type === "LP Token" ? (
        <Toggle
          lightMode={lightMode}
          active={toggleType}
          pool={pool}
          onClick={() => setToggleType(!toggleType)}
        /> 
      ) : (
        null
      )}
     

      <div className="addliquidity_descriptiontab">
        <div
          className={`addliquidity_description ${
            lightMode && 'addliquidity_description--light'
          }`}
        >
          <p
            className={`addliquidity_description_title ${
              lightMode && 'addliquidity_description_title--light'
            }`}
          >
            Description
          </p>

          {toggleType ? (

            <p className="description_description">
              This is a {pool.platform} liquidity pool composed of{' '}
              <a
                href="https://app.sushi.com/legacy/pool?chainId=42161"
                className="span"
              >
                {pool.name}
              </a>{' '}
              tokens. Your LP tokens are deposited directly into our vaults and
              then staked in the {pool.platform} protocol for {pool.reward}{' '}
              rewards. All rewards are sold to purchase more LP tokens.{' '}
            </p>

          ): (
            <p className="description_description">
              This is a {pool.platform} liquidity pool composed of <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">{pool.name}</a> tokens. 
              Your native ETH token is zapped into the liquidity pool and the deposit token is then staked in the {pool.platform} protocol 
              for {pool.reward} rewards. All rewards are sold to purchase more LP tokens. 
            </p>
          )}

          
        </div>

        <div
          className={`addliquidity_tab ${
            lightMode && 'addliquidity_tab--light'
          }`}
        >
          <div
            className={`inside_toggle ${
              !currentWallet && 'inside_toggle-none'
            }`}
          >
            {toggleType ? (

              <div className={`addliquidity_weth_bal ${lightMode && 'addliquidity_weth_bal--light'}`}>
                <p>{pool.name} balance:</p>
                {price * lpUserBal < 0.01 ? <p>0</p> : <p>{lpUserBal}</p>}
              </div>
            ) : (
              <div className={`addliquidity_weth_bal ${lightMode && "addliquidity_weth_bal--light"}`}>
                  <p>ETH balance:</p>
                  <p>{ethUserBal.toFixed(5)}</p>
              </div>
            )}

            {toggleType ? (

              <div className={`deposit_tab ${!currentWallet && 'deposit_tab-disable'}`}>
                <div className={`weth_deposit_amount ${lightMode && 'weth_deposit_amount--light'}`}>
                  <input
                    type="number"
                    className={`weth_bal_input ${
                      lightMode && 'weth_bal_input--light'
                    }`}
                    placeholder="0.0"
                    value={lpDepositAmount}
                    onChange={handleDepositChange}
                  />

                  <p className={`deposit_max ${lightMode && 'deposit_max--light'}`} onClick={maxDeposit}>
                    max
                  </p>
                </div>

                <div className={`deposit_deposits ${lightMode && 'deposit_deposits--light'}`}>
                    {!lpDepositAmount || lpDepositAmount <= 0 ? (
                    <div className={`deposit_zap1_button_disable ${lightMode && 'deposit_zap1_button_disable--light'}`}>
                      <p>Deposit</p>
                    </div>
                  ) : lpDepositAmount > lpUserBal ? (
                    <div className={`deposit_zap1_button_disable ${lightMode && 'deposit_zap1_button_disable--light'}`}>
                      <p>Insufficient Balance</p>
                    </div>
                  ) : (
                    <div className={`deposit_zap_button ${lightMode && 'deposit_zap_button--light'}`}
                      onClick={depositAmount}
                    >
                      <p>Deposit</p>
                    </div>
                  )}
                  </div>
              </div>

          ) : (
            <div className={`deposit_tab ${!currentWallet && 'deposit_tab-disable'}`}>
                <div className={`weth_deposit_amount ${lightMode && 'weth_deposit_amount--light'}`}>
                  <input
                    type="number"
                    className={`weth_bal_input ${
                      lightMode && 'weth_bal_input--light'
                    }`}
                    placeholder="0.0"
                    value={ethDepositAmount}
                    onChange={handleEthDepositChange}
                  />

                  <p className={`deposit_max ${lightMode && 'deposit_max--light'}`} onClick={maxEthDeposit}>
                    max
                  </p>
                </div>

                <div className={`deposit_deposits ${lightMode && 'deposit_deposits--light'}`}>
                    {!ethDepositAmount || ethDepositAmount <= 0 ? (
                    <div className={`deposit_zap1_button_disable ${lightMode && 'deposit_zap1_button_disable--light'}`}>
                      <p>Deposit</p>
                    </div>
                  ) : ethDepositAmount > ethUserBal ? (
                    <div className={`deposit_zap1_button_disable ${lightMode && 'deposit_zap1_button_disable--light'}`}>
                      <p>Insufficient Balance</p>
                    </div>
                  ) : (
                    <div className={`deposit_zap_button ${lightMode && 'deposit_zap_button--light'}`}
                      onClick={zapDeposit}
                    >
                      <p>Deposit</p>
                    </div>
                  )}
                  </div>
              </div>
          )}
            
        </div>

          {currentWallet ? null : (
            <div
              className={`no_overlay ${!currentWallet && 'overlay'}`}
              onClick={connectWallet}
            >
              <p>connect wallet</p>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div
          className={`deposit_spinner ${lightMode && 'deposit_spinner--light'}`}
        >
          <div className={`deposit_spinner_top`}>
            <div className={`deposit_spinner-left`}>
              {success === 'success' ? (
                <AiOutlineCheckCircle
                  style={{ color: '#00E600', fontSize: '20px' }}
                />
              ) : success === 'loading' ? (
                <MoonLoader
                  size={20}
                  loading={isLoading}
                  color={'rgb(89, 179, 247)'}
                />
              ) : success === 'fail' ? (
                <MdOutlineErrorOutline style={{ color: '#e60000' }} />
              ) : null}
            </div>

            <div className={`deposit_spinner_right`}>
              <p style={{ fontWeight: '700' }}>{loaderMessage}</p>
              <p className={`deposit_second`}>{secondaryMessage}</p>
            </div>
          </div>

          <div className={`deposit_spinner_bottom`}> 
          {link ? (
            <div className={`deposit_spinner_bottom_left`} onClick={() =>
              window.open(`https://arbiscan.io/tx/${hash}`, '_blank')
            }>
              <p>Details</p>
            </div>

          ) : null}
            
            <div className={`deposit_spinner_bottom_right`} onClick={() => {setLoading(false); setLink(false); setHash(''); refresh();}}>
              <p>Dismiss</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deposit;
