import { useState, useEffect } from 'react';
import Toggle from '../Toggle';
import { getUserVaultBalance, withdraw, zapOut } from './withdraw-function';
import { MoonLoader } from 'react-spinners';
import './Withdraw.css';

function Withdraw({ lightMode, pool, currentWallet, connectWallet }: any) {
  const [toggleType, setToggleType] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [withdrawAmt, setWithdrawAmt] = useState(0.0);

  const [userVaultBal, setUserVaultBalance] = useState(0);

  useEffect(() => {
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
  }, [pool, currentWallet]);

  const handleWithdrawChange = (e: any) => {
    setWithdrawAmt(e.target.value);
  };

  return (
    <div className="whole_tab">
      <Toggle
        lightMode={lightMode}
        active={toggleType}
        pool={pool}
        onClick={() => setToggleType(!toggleType)}
      />

      <div className="detail_container">
        <div
          className={`withdrawal_description ${
            lightMode && 'withdrawal_description--light'
          }`}
        >
          <p
            className={`withdrawal_title ${
              lightMode && 'withdrawal_title--light'
            }`}
          >
            Removal of Liquidity
          </p>
          {toggleType ? (
            <p className="withdrawal_description2">
              Your deposited LP token can be withdrawn from the autocompounding
              vault back to the user's connected wallet.{' '}
            </p>
          ) : (
            <p className="withdrawal_description2">
              Your deposited LP token can be withdrawn from the autocompounding
              vault back into wallet as native ETH tokens.{' '}
            </p>
          )}
        </div>

        <div className={`withdraw_tab ${lightMode && 'withdraw_tab--light'}`}>
          <div
            className={`inside_toggle ${
              !currentWallet && 'inside_toggle-none'
            }`}
          >
            <div className={`lp_bal ${lightMode && 'lp_bal--light'}`}>
              <p>LP Balance:</p>
              <p>{userVaultBal.toFixed(4)}</p>
            </div>

            <div
              className={`withdraw_tab2 ${
                !currentWallet && 'withdraw_tab2-disable'
              }`}
            >
              <div
                className={`lp_withdraw_amount ${
                  lightMode && 'lp_withdraw_amount--light'
                }`}
              >
                <input
                  type="number"
                  className={`lp_bal_input ${
                    lightMode && 'lp_bal_input--light'
                  }`}
                  placeholder="0.0"
                  value={withdrawAmt}
                  onChange={handleWithdrawChange}
                />
              </div>
              {toggleType ? (
                <div
                  className={`zap_button ${lightMode && 'zap_button--light'}`}
                  onClick={() =>
                    withdraw(
                      pool,
                      withdrawAmt,
                      setWithdrawAmt,
                      setLoading,
                      setLoaderMessage
                    )
                  }
                >
                  <p>Withdraw LP</p>
                </div>
              ) : (
                <div
                  className={`zap_button ${lightMode && 'zap_button--light'}`}
                  onClick={() =>
                    zapOut(
                      setLoading,
                      setLoaderMessage,
                      pool,
                      withdrawAmt,
                      setWithdrawAmt
                    )
                  }
                >
                  <p>Withdraw ETH</p>
                </div>
              )}
            </div>
          </div>

          {currentWallet ? null : (
            <div
              className={`no_overlay ${!currentWallet && 'overlay'}`}
              onClick={connectWallet}
            >
              <p>Connect Wallet</p>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="spinner">
          <MoonLoader size={25} loading={isLoading} color="#36d7b7" />
          <div className={`spinner_description`}>
            <p>{loaderMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Withdraw;
