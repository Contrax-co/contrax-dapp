import React, {useState, useEffect} from 'react'
import './Deposit.css';
import Toggle from '../Toggle';
import {MoonLoader} from "react-spinners";
import { deposit, getEthBalance, getLPBalance, zapIn } from './deposit-functions';


function Deposit({lightMode, pool, currentWallet, connectWallet}:any) {
    const [toggleType, setToggleType] = useState(false);

    const [ethUserBal, setEthUserBal] = useState(0);
    const [lpUserBal, setLPUserBal] = useState(0);

    const [isLoading, setLoading] = useState(false);

    const [lpDepositAmount, setLPDepositAmount] = useState(0.0); 
    const [ethZapAmount, setEthZapAmount] = useState(0.0);

    const [loaderMessage, setLoaderMessage] = useState('');

    useEffect(() => {
        getEthBalance(currentWallet, setEthUserBal, ethUserBal); 
        getLPBalance(pool, currentWallet, setLPUserBal, lpUserBal);
    }, [currentWallet, ethUserBal, pool, lpUserBal])


    const handleDepositChange = (e:any) => {
        setLPDepositAmount(e.target.value);
    }

    const handleZapChange = (e:any) => {
        setEthZapAmount(e.target.value);
    }

  return (
    <div className="addliquidity_outsidetab">
 
        <Toggle
            lightMode={lightMode}
            active={toggleType}
            pool={pool}
            onClick={() => setToggleType(!toggleType)}
        />

        <div className="addliquidity_descriptiontab">

            <div className={`addliquidity_description ${lightMode && "addliquidity_description--light"}`}>
                <p className={`addliquidity_description_title ${lightMode && "addliquidity_description_title--light"}`}>Description</p>

                {toggleType ? (

                    <p className="description_description">This is a {pool.platform} liquidity pool composed of <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">{pool.name}</a> tokens. 
                    Your LP tokens are deposited directly into our vaults and then staked in the {pool.platform} protocol 
                    for {pool.reward} rewards. All rewards are sold to purchase more LP tokens. </p>

                ): (

                    <p className="description_description">This is a {pool.platform} liquidity pool composed of <a href="https://app.sushi.com/legacy/pool?chainId=42161" className="span">{pool.name}</a> tokens. 
                    Your native ETH token is zapped into the liquidity pool and the deposit token is then staked in the {pool.platform} protocol 
                    for {pool.reward} rewards. All rewards are sold to purchase more LP tokens. </p>

                )}
                
            </div>

            <div className={`addliquidity_tab ${lightMode && "addliquidity_tab--light"}`}>

                <div className={`inside_toggle ${!currentWallet && "inside_toggle-none"}`}>

                    {toggleType ? (

                        <div className={`addliquidity_weth_bal ${lightMode && "addliquidity_weth_bal--light"}`}>
                            <p>{pool.name} balance:</p>
                            <p>{lpUserBal.toFixed(3)}</p>
                        </div>

                    ) : (

                        <div className={`addliquidity_weth_bal ${lightMode && "addliquidity_weth_bal--light"}`}>
                            <p>ETH balance:</p>
                            <p>{ethUserBal.toFixed(3)}</p>
                        </div>

                    )}

                    {toggleType ? (

                        <div className={`deposit_tab ${!currentWallet && "deposit_tab-disable"}`}>
                            <div className={`weth_deposit_amount ${lightMode && "weth_deposit_amount--light"}`}>
                                <input type="number" className={`weth_bal_input ${lightMode && "weth_bal_input--light"}`} placeholder="0.0" value={lpDepositAmount} onChange={handleDepositChange}/>
                            </div>
                            <div className={`zap_button ${lightMode && "zap_button--light"}`} 
                                 onClick={() => deposit(pool, lpDepositAmount, setLPDepositAmount, setLoading, setLoaderMessage)}
                            >
                                <p>Deposit LP</p>
                            </div>
                        </div>

                    ) : (

                        <div className={`deposit_tab ${!currentWallet && "deposit_tab-disable"}`}>
                            <div className={`weth_deposit_amount ${lightMode && "weth_deposit_amount--light"}`}>
                                <input type="number" className={`weth_bal_input ${lightMode && "weth_bal_input--light"}`} placeholder="0.0" value={ethZapAmount} onChange={handleZapChange}/>
                            </div>
                            <div className={`zap_button ${lightMode && "zap_button--light"}`} 
                                onClick={() => zapIn(setLoading, pool, ethZapAmount, setEthZapAmount, setLoaderMessage)}
                            >
                                <p>Deposit ETH</p>
                            </div>
                            
                        </div>

                    )}

                </div>

               {currentWallet ? null : (
                    <div className={`no_overlay ${!currentWallet && "overlay"}`} onClick={connectWallet}>
                        <p>connect wallet</p>
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
  )
}

export default Deposit