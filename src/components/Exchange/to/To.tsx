import React, {useState, useEffect} from 'react';
import { HiChevronDown } from 'react-icons/hi';
import './To.css';

function To({lightMode, setOpenModal, tokens, tokenId, setTokenType, setToAddress}:any) {

  const token = tokens.slice(tokenId - 1, tokenId);

  const[tokenName, setTokenName] = useState("");
  const[tokenSrc, setTokenSrc] = useState("");
  const[tokenAlt, setTokenAlt] = useState("");


  useEffect(() => {

      token.forEach((token:any) => {
        setTokenName(token.token_name);
        setTokenSrc(token.token_logo);
        setTokenAlt(token.token_alt);
        setTokenType(token.token_sub);
        setToAddress(token.address);
    })
  }, [token])


  return (
    <div>
        <p>To</p>
        <div className={`to__input ${lightMode && 'to__input--light'}`}>

            <input
                type="number"
                placeholder="0.0"
                className={`to__amount ${lightMode && 'to__amount--light'}`}
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