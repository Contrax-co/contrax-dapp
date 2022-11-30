import React, {useState, useEffect} from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { priceToken } from '../from/from-functions';
import { userBalTo } from './to-functions';
import './To.css';

function To({
  lightMode, setOpenModal, tokens, tokenId, setTokenType, 
  setToAddress, setToValue, toValue, toAddress, setToName, setToImg, 
  setToAlt, currentWallet
}:any) {

  const token = tokens.slice(tokenId - 1, tokenId);

  const[tokenName, setTokenName] = useState("");
  const[tokenSrc, setTokenSrc] = useState("");
  const[tokenAlt, setTokenAlt] = useState("");

  const [swapAmount, setSwapAmount] = useState(0.0);
  const [toAbi, setToAbi] = useState([]);

  const [amt, setAmt] = useState(0.0);
  const [price, setPrice] = useState(0); 


  useEffect(() => {

      token.forEach((token:any) => {
        setTokenName(token.token_name);
        setTokenSrc(token.token_logo);
        setToImg(token.token_logo);
        setTokenAlt(token.token_alt);
        setToAlt(token.token_alt);
        setTokenType(token.token_sub);
        setToAddress(token.address);
        setToName(token.token_name);
        setToAbi(token.token_abi);
    })
  }, [token, setTokenType, setToAddress, setToAlt, setToImg, setToName]);

  useEffect(() => {
    userBalTo(currentWallet, tokenName, setAmt, toAddress, toAbi);
    priceToken(toAddress, setPrice); 
  }, [tokenName, currentWallet, toAddress, toAbi, toValue])

  const handleSwapChange = (e: any) => {
    setSwapAmount(e.target.value);
    setToValue(e.target.value);
  };

  useEffect(() => {
    setSwapAmount(toValue);
  }, [toValue]);


  return (
    <div>

      <div className="to_div">
            <p>To</p>
            <div className={`to_values`}>
                <p className={`to_usd ${lightMode && 'to_usd--light'}`}>{(price * amt).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                </p>

                {(amt * price) < 0.01 ? (
                  <p className={`swap_amount ${lightMode && 'swap_amount--light'}`}>0</p>
                ) : (
                  <p className={`swap_amount ${lightMode && 'swap_amount--light'}`}>{amt.toFixed(12)}</p>
                )}
                
               
            </div>
        
        </div>

        <div className={`to__input ${lightMode && 'to__input--light'}`}>

            <input
                type="number"
                placeholder="0.0"
                className={`to__amount ${lightMode && 'to__amount--light'}`}
                value={swapAmount}
                onChange={handleSwapChange}
            />

            <div
              className={`dropdown__to ${lightMode && 'dropdown__to--light'}`}
              onClick={() => setOpenModal(true)}
            >

                <img
                    className={`swap__logo`}
                    alt={tokenAlt}
                    src={tokenSrc}
                />
                <p>{tokenName}</p>
                 <HiChevronDown />

            </div>

        </div>
    </div>
  )
}

export default To