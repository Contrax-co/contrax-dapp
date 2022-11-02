import React, {useState, useEffect} from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { estimateValueFrom } from './to-functions';
import './To.css';

function To({
  lightMode, setOpenModal, tokens, tokenId, setTokenType, 
  setToAddress, setToValue, toValue, fromAddress, toAddress, 
  setValue, setToName, setToImg, setToAlt
}:any) {

  const token = tokens.slice(tokenId - 1, tokenId);

  const[tokenName, setTokenName] = useState("");
  const[tokenSrc, setTokenSrc] = useState("");
  const[tokenAlt, setTokenAlt] = useState("");

  const [swapAmount, setSwapAmount] = useState(0.0);


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
    })
  }, [token, setTokenType, setToAddress, setToAlt, setToImg, setToName])

  const handleSwapChange = (e: any) => {
    setSwapAmount(e.target.value);
    setToValue(e.target.value);
    estimateValueFrom(fromAddress, toAddress, e.target.value, setValue); 
    
  };

  useEffect(() => {
    setSwapAmount(toValue);
  }, [toValue]);


  return (
    <div>
        <p>To</p>
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