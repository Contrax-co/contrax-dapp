import {useEffect, useState} from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { totalFrom } from './from-functions';
import "./From.css";


function From({lightMode, setOpenModal, tokens, tokenId, currentWallet, setValue, setTokenType, setFromAddress, setAbi}: any) {

    const token = tokens.slice(tokenId - 1, tokenId);

    const[tokenName, setTokenName] = useState("");
    const[tokenSrc, setTokenSrc] = useState("");
    const[tokenAlt, setTokenAlt] = useState("");
    const[tokenLp, setTokenLp] = useState("");

    const[fromAmt, setFromAmt] = useState(0); 
    const[tokenAbi, setTokenAbi] = useState([]);

    const [swapAmount, setSwapAmount] = useState(0.0);



    useEffect(() => {
        token.forEach((token:any) => {
            setTokenName(token.token_name);
            setTokenSrc(token.token_logo);
            setTokenAlt(token.token_alt);
            setTokenAbi(token.token_abi);
            setTokenLp(token.address);
            setTokenType(token.token_sub);
            setFromAddress(token.address);
            setAbi(JSON.stringify(token.token_abi))
        })

        totalFrom(currentWallet, tokenName, setFromAmt, tokenLp, tokenAbi);

    }, [currentWallet, tokenName, tokenLp, tokenAbi, token, setFromAddress, setTokenType, setAbi])

    const handleSwapChange = (e: any) => {
        setSwapAmount(e.target.value);
        setValue(e.target.value);
      };

  return (
    <div>
        <div className="from_div">
            <p>From</p>
            <p>{fromAmt.toFixed(4)}</p> 
        </div>

        <div className={`from__input ${lightMode && 'from__input--light'}`}>
            <input
                type="number"
                placeholder="0.0"
                className={`from__amount ${lightMode && 'from__amount--light'}`}
                value={swapAmount}
                onChange={handleSwapChange}
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