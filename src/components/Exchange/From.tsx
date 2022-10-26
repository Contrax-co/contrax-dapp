import {useEffect, useState} from 'react';
import { HiChevronDown } from 'react-icons/hi';
import "./From.css";


function From({lightMode, setOpenModal, tokens, tokenId}: any) {

    const token = tokens.slice(tokenId - 1, tokenId);

    const[tokenName, setTokenName] = useState("");
    const[tokenSrc, setTokenSrc] = useState("");
    const[tokenAlt, setTokenAlt] = useState("");


    useEffect(() => {
        token.forEach((token:any) => {
            setTokenName(token.token_name);
            setTokenSrc(token.token_logo);
            setTokenAlt(token.token_alt);
        })
    })

  return (
    <div>
        <p>From</p>
        <div className={`from__input ${lightMode && 'from__input--light'}`}>
            <input
                type="number"
                placeholder="0.0"
                className={`from__amount ${lightMode && 'from__amount--light'}`}
            />

            <div
                className={`dropdown__from ${
                    lightMode && 'dropdown__from--light'
                }`}
                onClick={() => setOpenModal(true)}
            >

                <img
                    className={`swap__logo`}
                    alt= {tokenAlt}                  
                    src={tokenSrc}                               
                />

                <p>{tokenName}</p>
                <HiChevronDown />

            </div>

        </div>
    </div>
  )
}

export default From