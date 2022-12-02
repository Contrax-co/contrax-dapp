import { useState, useEffect } from 'react';
import { getUserVaultBalance, withdraw, withdrawAll } from './withdraw-function';
import { MoonLoader } from 'react-spinners';
import './Withdraw.css';
import {AiOutlineCheckCircle} from "react-icons/ai";
import {MdOutlineErrorOutline} from "react-icons/md";
import { priceToken } from '../compound-item/compound-functions';

function Withdraw({ lightMode, pool, currentWallet, connectWallet }: any) {
  const [loaderMessage, setLoaderMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [withdrawAmt, setWithdrawAmt] = useState(0.0);

  const [userVaultBal, setUserVaultBalance] = useState(0);
  const [success, setSuccess] = useState("loading");
  const [secondaryMessage, setSecondaryMessage] = useState('');

  const [price, setPrice] = useState(0);

  useEffect(() => {
    getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
    priceToken(pool.lp_address, setPrice); 
  }, [pool, currentWallet]);

  const handleWithdrawChange = (e: any) => {
    setWithdrawAmt(e.target.value);
  };

  function withdrawFunction () {
    if(withdrawAmt === userVaultBal){
      withdrawAll(
        setUserVaultBalance, 
        currentWallet, 
        setSuccess, 
        setSecondaryMessage, 
        pool, 
        setWithdrawAmt, 
        setLoading, 
        setLoaderMessage
      )
    }else {
      withdraw(
        setUserVaultBalance,
        currentWallet,
        setSuccess,
        setSecondaryMessage,
        pool,
        withdrawAmt,
        setWithdrawAmt,
        setLoading,
        setLoaderMessage
      )
    }
  }

  function withdrawMax() {
    setWithdrawAmt(userVaultBal);
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
            {userVaultBal * price < 0.01 ? (
              <div className={`lp_bal ${lightMode && 'lp_bal--light'}`}>
               <p>LP Balance:</p>
               <p>0</p>
             </div>
            ) :(
              <div className={`lp_bal ${lightMode && 'lp_bal--light'}`}>
                <p>LP Balance:</p>
                <p>{userVaultBal.toFixed(10)}</p>
              </div>
            )}

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
                <p className={`withdraw_max ${lightMode && 'withdraw_max--light'}`}
                  onClick={withdrawMax}>
                  max
                </p>
              </div>
              
              <div className={`withdraw_withdraw ${lightMode && 'withdraw_withdraw--light'}`}>
                {!withdrawAmt || withdrawAmt <= 0 ? (
                  <div className={`withdraw_zap1_button_disable ${lightMode && 'withdraw_zap1_button_disable--light'}`}>
                    <p>Withdraw</p>
                  </div>
                ) : withdrawAmt > userVaultBal ? (

                  <div className={`withdraw_zap1_button_disable ${lightMode && 'withdraw_zap1_button_disable--light'}`} >
                    <p>Insufficient Balance</p>
                  </div>

                ): (
                  <div
                  className={`deposit_zap_button ${lightMode && 'deposit_zap_button--light'}`}
                  onClick={withdrawFunction}
                  >
                  <p>Withdraw</p>
                </div>

                )}
               
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
              <p className={`withdraw_second`}>{secondaryMessage}</p>
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
