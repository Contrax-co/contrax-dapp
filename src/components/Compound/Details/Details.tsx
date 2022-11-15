import React, {useEffect, useState} from 'react';
import { RiArrowUpSLine } from 'react-icons/ri';
import { priceOfToken, userTokenAmount, userVaultAmount } from './details-functions';
import "./Details.css";

function Details({lightMode, currentWallet, tokenAddress, token_abi, 
  pair1, pair2, alt1, alt2, logo1, logo2, token1, token2,
  vaultAddress, vault_abi, ...props}:any) {

  const [price1, setPrice1] = useState(0);
  const [price2, setPrice2] = useState(0);

  const [lpPrice, setLPPrice] = useState(0);

  const [unstakedTokenValue, setUnstakedTokenValue] = useState(0);
  const [stakedTokenValue, setStakedTokenValue] = useState(0);


  useEffect(() => {
    priceOfToken(token1, setPrice1); 
    priceOfToken(token2, setPrice2); 
    priceOfToken(tokenAddress, setLPPrice);

    userTokenAmount(currentWallet, tokenAddress, token_abi, setUnstakedTokenValue); 
    userVaultAmount(currentWallet, vaultAddress, vault_abi, setStakedTokenValue);
  }, [token1, token2, currentWallet, token_abi, tokenAddress, vaultAddress, vault_abi])

  return (
    <div>

      <div className={`details_top_container`}>

        <div className={`details_leftside`}>
            <div className={`details_dropdrown_header`}>
              <img className={`details_logo1`} alt={alt1} src={logo1}/>
              <img className={`details_logo2`} alt={alt2} src={logo2}/>
              <p className={`details_pair_name ${lightMode && 'details_pair_name--light'}`}>{pair1}/{pair2}</p>
            </div>

            <div className={`token_details`}>
              <div className={`details_single_token ${lightMode && 'details_single_token--light'}`} style={{marginRight:"10px"}}>
                <img className={`mini_details_image`} alt={alt1} src={logo1}/>
                <p>{pair1} = {price1.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}</p>
              </div>

              <div className={`details_single_token ${lightMode && 'details_single_token--light'}`}>
                <img className={`mini_details_image`} alt={alt2} src ={logo2}/>
                <p>{pair2} = {price2.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}</p>
              </div>

            </div> 
        </div>

        <div className={`detailed_position ${lightMode && 'detailed_position--light'}`}>
          <p className={`detailed_position_total ${lightMode && 'detailed_position_total--light'}`}>My Position</p>

          <div className={`detailed_header`}>
            <p>Unstaked Position</p>
            <div className={`unstaked_details`}>
              <div className={`unstaked_details_header`}> 
                <img className={`unstaked_images1`} alt={alt1} src={logo1}/>
                <img className={`unstaked_images2`} alt={alt2} src={logo2}/>
                <p className={`detailed_unstaked_pairs`}>{unstakedTokenValue.toFixed(3)} {pair1}-{pair2}</p>
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
                <img className={`unstaked_images1`} alt={alt1} src={logo1}/>
                <img className={`unstaked_images2`} alt={alt2} src={logo2}/>
                <p className={`detailed_unstaked_pairs`}>{stakedTokenValue.toFixed(3)} {pair1}-{pair2}</p>
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
        <RiArrowUpSLine />
      </div>
  

    </div>
  )
}

export default Details