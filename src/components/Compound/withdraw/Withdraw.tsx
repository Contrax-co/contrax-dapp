import { useState, useEffect } from 'react';
import { getUserVaultBalance, withdraw, withdrawAll } from './withdraw-function';
import { MoonLoader } from 'react-spinners';
import './Withdraw.css';
import { getGasPrice } from '../../Dashboard/WalletItem/wallet-functions';
import {AiOutlineCheckCircle} from "react-icons/ai";
import {MdOutlineErrorOutline} from "react-icons/md";

function Withdraw({ lightMode, pool, currentWallet, connectWallet }: any) {
  const [loaderMessage, setLoaderMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [withdrawAmt, setWithdrawAmt] = useState(0.0);

  const [userVaultBal, setUserVaultBalance] = useState(0);
  const [gasPrice, setGasPrice] = useState(); 
  const [success, setSuccess] = useState("loading");
  const [secondaryMessage, setSecondaryMessage] = useState('');

  useEffect(() => {
    getGasPrice(setGasPrice);
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
  }, [pool, currentWallet]);

  const handleWithdrawChange = (e: any) => {
    setWithdrawAmt(e.target.value);
  };

  function withdrawFunction () {
    withdraw(
      setUserVaultBalance,
      currentWallet,
      setSuccess,
      setSecondaryMessage,
      gasPrice,
      pool,
      withdrawAmt,
      setWithdrawAmt,
      setLoading,
      setLoaderMessage
    )
  }

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
              <p>{userVaultBal.toPrecision(3)}</p>
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
              
              <div className={`withdraw_withdraw ${lightMode && 'withdraw_withdraw--light'}`}>
                <div
                  className={`deposit_zap_button ${lightMode && 'deposit_zap_button--light'}`}
                  onClick={!withdrawAmt || withdrawAmt <= 0  || withdrawAmt >= userVaultBal ? () => {} : withdrawFunction}
                >
                  <p>Withdraw {pool.name}</p>
                </div>

                <div 
                  className={`withdraw_all ${lightMode && 'withdraw_all--light'}`}
                  onClick={() => {
                    withdrawAll(
                      setUserVaultBalance, 
                      currentWallet, 
                      setSuccess, 
                      setSecondaryMessage, 
                      gasPrice, 
                      pool,
                      setWithdrawAmt, 
                      setLoading, 
                      setLoaderMessage
                    )
                  }}
                >
                  Withdraw all
                </div>
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
        <div className={`withdraw_spinner ${lightMode && 'withdraw_spinner--light'}`}>
          
          <div className={`withdraw_spinner_top`}>

            <div className={`withdraw_spinner-left`}>

              {success === "success" ? (
                <AiOutlineCheckCircle style={{color: "#00E600", fontSize: "20px"}}/> 
              ): (success === "loading") ? (
                <MoonLoader size={20} loading={isLoading} color={'rgb(89, 179, 247)'}/> 
              ): (success === "fail") ? (
                <MdOutlineErrorOutline style={{color:"#e60000"}} />
              ): null}

            </div>

            <div className={`withdraw_spinner_right`}>
              <p style={{fontWeight:'700'}}>{loaderMessage}</p>
              <p style={{fontSize:'13px'}}>{secondaryMessage}</p>
            </div>

          </div>

          <div className={`withdraw_spinner_bottom`} onClick={() => setLoading(false)}>
            <p>Dismiss</p>
          </div> 

        </div>
      )}
    </div>
  );
}

export default Withdraw;
