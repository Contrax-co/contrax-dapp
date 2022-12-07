import React, {useEffect, useState} from 'react';
import { RiArrowUpSLine } from 'react-icons/ri';
import { priceOfToken, userTokenAmount, userVaultAmount } from './details-functions';
import "./Details.css";

function Details({lightMode, currentWallet, pool, ...props}:any) {

  const [price1, setPrice1] = useState(0);
  const [price2, setPrice2] = useState(0);

  const [lpPrice, setLPPrice] = useState(0);

  const [unstakedTokenValue, setUnstakedTokenValue] = useState(0);
  const [stakedTokenValue, setStakedTokenValue] = useState(0);


  useEffect(() => {
    priceOfToken(pool.token1, setPrice1); 
    priceOfToken(pool.token2, setPrice2); 
    priceOfToken(pool.lp_address, setLPPrice);

    userTokenAmount(currentWallet, pool.lp_address, pool.lp_abi, setUnstakedTokenValue); 
    userVaultAmount(currentWallet, pool.vault_addr, pool.vault_abi, setStakedTokenValue);
  }, [pool, currentWallet])

  return (
    <div>

      <div className={`details_top_container`}>

        <div className={`details_leftside`}>
            <div className={`details_dropdrown_header`}>
              {pool.alt1 ? (
                <img className={`details_logo1`} alt={pool.alt1} src={pool.logo1}/>
              ): null}

              {pool.alt2 ? (
                <img className={`details_logo2`} alt={pool.alt2} src={pool.logo2}/>
              ): null}
              
              {pool.pair2 ? (
                 <p className={`details_pair_name ${lightMode && 'details_pair_name--light'}`}>{pool.pair1}/{pool.pair2}</p>
              ): (
                <p className={`details_pair_name ${lightMode && 'details_pair_name--light'}`}>{pool.pair1}</p>
              )}
             
            </div>

            <div className={`token_details`}>
              {pool.alt1 ? (
                <div className={`details_single_token ${lightMode && 'details_single_token--light'}`} style={{marginRight:"10px"}}>
                  <img className={`mini_details_image`} alt={pool.alt1} src={pool.logo1}/>
                  <p>
                    {pool.pair1} = {price1.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                  </p>
                </div>
              ): null}

              {pool.alt2 ? (
                <div className={`details_single_token ${lightMode && 'details_single_token--light'}`}>
                  <img className={`mini_details_image`} alt={pool.alt2} src ={pool.logo2}/>
                  <p>{pool.pair2} = {price2.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}</p>
                </div>
              ): null}
             

              

            </div> 
        </div>

        <div className={`detailed_position ${lightMode && 'detailed_position--light'}`}>
          <p className={`detailed_position_total ${lightMode && 'detailed_position_total--light'}`}>My Position</p>

          <div className={`detailed_header`}>
            <p>Unstaked Position</p>
            <div className={`unstaked_details`}>
              <div className={`unstaked_details_header`}> 
                {pool.alt1 ? (
                  <img className={`unstaked_images1`} alt={pool.alt1} src={pool.logo1}/>
                ) : null}
                
                {pool.alt2 ? (
                  <img className={`unstaked_images2`} alt={pool.alt2} src={pool.logo2}/>
                ): null}
                
                <p className={`detailed_unstaked_pairs`}>{unstakedTokenValue.toFixed(3)} {pool.name}</p>
              </div>
              
              
              <p className={`detailed_unstaked_pairs`}>{(lpPrice * unstakedTokenValue).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
              })}</p>
            </div>
            
          </div>

          <div className={`detailed_header`}>
            <p>Staked Position</p>
            <div className={`unstaked_details`}>
            
            <div className={`unstaked_details_header`}> 
                {pool.alt1 ? (
                  <img className={`unstaked_images1`} alt={pool.alt1} src={pool.logo1}/>
                ) : null}
                
                {pool.alt2 ? (
                  <img className={`unstaked_images2`} alt={pool.alt2} src={pool.logo2}/>
                ) : null}
                
                <p className={`detailed_unstaked_pairs`}>{stakedTokenValue.toFixed(3)} {pool.name}</p>
            </div>
            <p className={`detailed_unstaked_pairs`}>{(lpPrice * stakedTokenValue).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
              })}</p>
            </div>
            
          </div>
          
        </div>

      </div>
     
      <div className={`details_retract ${lightMode && 'details_retract--light'}`} onClick={props.onClick}>
        <p className={`details_retract_description ${lightMode && 'details_retract_description--light'}`}>See Less</p>
        <RiArrowUpSLine style={{marginTop:"-15px"}} />
      </div>
  

    </div>
  )
}

export default Details