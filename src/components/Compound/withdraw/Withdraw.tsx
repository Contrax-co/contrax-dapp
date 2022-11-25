import { useState, useEffect } from 'react';
import { getUserVaultBalance, withdraw } from './withdraw-function';
import { MoonLoader } from 'react-spinners';
import './Withdraw.css';
import { getGasPrice } from '../../Dashboard/WalletItem/wallet-functions';

function Withdraw({ lightMode, pool, currentWallet, connectWallet }: any) {
  const [loaderMessage, setLoaderMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [withdrawAmt, setWithdrawAmt] = useState(0.0);

  const [userVaultBal, setUserVaultBalance] = useState(0);
  const [gasPrice, setGasPrice] = useState(); 

  useEffect(() => {
    getGasPrice(setGasPrice);
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
  }, [pool, currentWallet]);

  const handleWithdrawChange = (e: any) => {
    setWithdrawAmt(e.target.value);
  };

  return (
    <div className="whole_tab">

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
            <p className="withdrawal_description2">
              Your deposited LP token can be withdrawn from the autocompounding
              vault back to the user's connected wallet.{' '}
            </p>
          
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
        
                <div
                  className={`deposit_zap_button ${lightMode && 'deposit_zap_button--light'}`}
                  onClick={() =>
                    withdraw(
                      gasPrice,
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
